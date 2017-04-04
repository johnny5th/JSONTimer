const config = require('./config');
const restify = require('restify');
const socketio = require('socket.io');
const redis = require("redis");
const mysql = require('mysql');
const JsonTimer = require('./app/JSONTimer.js');
const Account = require('./app/Account.js');

let server = restify.createServer();
let io = socketio.listen(server.server);

let redisDB = redis.createClient({
  host: config.redis_host,
  port: config.redis_port,
  prefix: config.redis_prefix
});
redisDB.on("error", function (err) {
  console.log("Redis Error " + err);
});

let mysqlDB = mysql.createPool({
  connectionLimit: 10,
  host: config.mysql_host,
  port: config.mysql_port,
  user: config.mysql_user,
  password: config.mysql_password,
  database: config.mysql_database
});

server.use(restify.bodyParser({mapParams: true}));

server.use((req, res, next) => {
  let urlArray = req.url.split("/");
  if(urlArray[1] == "timer" && typeof urlArray[2] != "undefined") {
    // Check if key exists
    return mysqlDB.query('SELECT count(keyid) as count FROM `timerKeys` WHERE `timerKey` = ?', [req.params.key], function (error, results) {
      if (error) throw error;

      if(results[0].count == 0) {
        return next(new restify.UnauthorizedError('API Key not found.'));
      }

      return next();
    });
  }

  return next();
});

// HTTP
server.get('/timer', (req, res, next) => {
  if(typeof req.params.key != 'undefined') {
    return next('getKey');
  }

  return next(new restify.UnauthorizedError('You must provide an API Key (/timer/[KEY]).'));
});

server.get({name: 'getKey', path: '/timer/:key'}, (req, res, next) => {
  let timer = new JsonTimer(req.params.key, redisDB, mysqlDB, function() {
    res.send(timer.getTimer());
  });

  return next();
});

server.post('/timer/:key/start', (req, res, next) => {
  let timer = new JsonTimer(req.params.key, redisDB, mysqlDB, function() {
    timer.startTimer(io.in(req.params.key));
    res.send(timer.getTimer());
  });

  return next();
});

server.post('/timer/:key/stop', (req, res, next) => {
  if(typeof req.params.description == 'undefined') {
    req.params.description = "";
  }

  let timer = new JsonTimer(req.params.key, redisDB, mysqlDB, function() {
    timer.stopTimer(io.in(req.params.key), req.params.description);
    res.send(timer.getTimer());
  });

  return next();
});

server.post('/account/add/:email', (req, res, next) => {
  let account = new Account(mysqlDB);

  account.create(req.params.email, function(key) {
    if(key == false) {
      return next(new restify.UnauthorizedError('Not a valid email address.'));
    }

    res.send({key: key});
  });
});

// Sockets
io.sockets.on('connection', function (socket) {
  let timerKey;

  socket.on('authenticate', function(key) {
    timerKey = key;
    let timer = new JsonTimer(timerKey, redisDB, mysqlDB, function() {
      if(timerKey in socket.rooms) {
        socket.emit('message', "You are already authenticated with this key.");
      } else {
        socket.join(timerKey);
        socket.emit('timer', timer.getTimer());
      }
    });
  });

  socket.on('startTimer', function () {
    let timer = new JsonTimer(timerKey, redisDB, mysqlDB, function() {
      timer.startTimer(io.in(timerKey));
    });
  });

  socket.on('stopTimer', function (description) {
    let timer = new JsonTimer(timerKey, redisDB, mysqlDB, function() {
      timer.stopTimer(io.in(timerKey), description);
    });
  });

  socket.on('getTimer', function() {
    let timer = new JsonTimer(timerKey, redisDB, mysqlDB, function() {
      socket.emit('timer', timer.getTimer());
    });
  });
});

server.listen(config.api_port, function() {
  console.log('%s listening at %s', server.name, server.url);
});
