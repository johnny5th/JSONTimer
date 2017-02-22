const restify = require('restify');
const socketio = require('socket.io');
const JsonTimer = require('./app/JsonTimer.js');

let server = restify.createServer();
let io = socketio.listen(server.server);
let timer = new JsonTimer(io.sockets);

// HTTP
server.get('/timer', (req, res, next) => {
  res.send(timer.getTimer());
});

server.post('/timer/start', (req, res, next) => {
  timer.startTimer();

  res.send(timer.getTimer());
});

server.post('/timer/stop', (req, res, next) => {
  timer.stopTimer();

  res.send(timer.getTimer());
});

// Sockets
io.sockets.on('connection', function (socket) {
  socket.emit('timer', timer.getTimer());

  socket.on('startTimer', function () {
    timer.startTimer();
  });

  socket.on('stopTimer', function () {
    timer.stopTimer();
  });

  socket.on('getTimer', function() {
    socket.emit('timer', timer.getTimer());
  });
});

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
