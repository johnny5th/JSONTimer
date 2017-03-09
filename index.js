const restify = require('restify');
const socketio = require('socket.io');
const redis = require("redis");
const mysql = require('mysql');
const JsonTimer = require('./app/JsonTimer.js');

let server = restify.createServer();
let io = socketio.listen(server.server);

let redisDB = redis.createClient({host: "localhost", port: 32771});
redisDB.on("error", function (err) {
  console.log("Redis Error " + err);
});

let mysqlDB = mysql.createConnection({
  host     : 'localhost',
  port     : '32770',
  user     : 'test',
  password : 'test',
  database : 'test'
});
mysqlDB.connect();

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

  socket.on('stopTimer', function () {
    let timer = new JsonTimer(timerKey, redisDB, mysqlDB, function() {
      timer.stopTimer(io.in(timerKey));
    });
  });

  socket.on('getTimer', function() {
    let timer = new JsonTimer(timerKey, redisDB, mysqlDB, function() {
      socket.emit('timer', timer.getTimer());
    });
  });
});

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
