const restify = require('restify');
const socketio = require('socket.io');
const JsonTimer = require('./app/JsonTimer.js');

let server = restify.createServer();
let io = socketio.listen(server.server);

// HTTP
server.get('/timer/:key', (req, res, next) => {
  let timer = new JsonTimer(req.params.key, function() {
    res.send(timer.getTimer());
  });
});

server.post('/timer/:key/start', (req, res, next) => {
  let timer = new JsonTimer(req.params.key, function() {
    timer.startTimer(io.in(req.params.key));
    res.send(timer.getTimer());
  });
});

server.post('/timer/:key/stop', (req, res, next) => {
  let timer = new JsonTimer(req.params.key, function() {
    timer.stopTimer(io.in(req.params.key));
    res.send(timer.getTimer());
  });
});

// Sockets
io.sockets.on('connection', function (socket) {
  let timerKey;

  socket.on('authenticate', function(key) {
    timerKey = key;
    let timer = new JsonTimer(timerKey, function() {
      if(timerKey in socket.rooms) {
        socket.emit('message', "You are already authenticated with this key.");
      } else {
        socket.join(timerKey);
        socket.emit('timer', timer.getTimer());
      }
    });
  });

  socket.on('startTimer', function () {
    let timer = new JsonTimer(timerKey, function() {
      timer.startTimer(io.in(key));
    });
  });

  socket.on('stopTimer', function () {
    let timer = new JsonTimer(timerKey, function() {
      timer.stopTimer(io.in(key));
    });
  });

  socket.on('getTimer', function() {
    let timer = new JsonTimer(timerKey, function() {
      socket.emit('timer', timer.getTimer());
    });
  });
});

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
