const Timer = require('../app/Timer');

module.exports = function(io) {
  io.sockets.on('connection', function (socket) {
    let apiKey;

    socket.on('authenticate', function(key) {
      apiKey = key;

      let timer = new Timer();
      timer.load(apiKey, (err) => {
        if (err) socket.emit('message', err);

        if(apiKey in socket.rooms) {
          socket.emit('message', 'You are already authenticated with this key.');
        } else {
          socket.join(apiKey);
          socket.emit('timer', timer.get());
        }
      });
    });

    socket.on('start', function () {
      let timer = new Timer();
      timer.load(apiKey, (err) => {
        if (err) socket.emit('message', err);

        timer.start();

        io.in(apiKey).emit('timer', timer.get());
      });
    });

    socket.on('stop', function (description) {
      let timer = new Timer();
      timer.load(apiKey, (err) => {
        if (err) socket.emit('message', err);

        timer.stop(description);

        io.in(apiKey).emit('timer', timer.get());
      });
    });

    socket.on('get', function () {
      let timer = new Timer();
      timer.load(apiKey, (err) => {
        if (err) socket.emit('message', err);

        io.in(apiKey).emit('timer', timer.get());
      });
    });
  });
};
