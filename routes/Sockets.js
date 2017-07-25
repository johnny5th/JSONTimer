const Timer = require('../app/Timer');

module.exports = function(io) {
  io.sockets.on('connection', function (socket) {

    socket.on('authenticate', function(key) {
      let timer = new Timer();
      timer.load(key, (err) => {
        if (err) socket.emit('message', err);

        socket.join(key);
        socket.emit('timer', timer.get());
      });
    });
  });
};
