const config = require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const socketio = require('socket.io');
const AuthRouter = require('./routes/Auth');
const TimerRouter = require('./routes/Timer');

let app = express();
app.use(bodyParser.json());

app.use(passport.initialize());
require('./utils/passport');

app.use('/api/auth', AuthRouter);
app.use('/api/timer', TimerRouter);

app.listen(config.api_port, function() {
  console.log('Listening on port %s', config.api_port);
});


// Sockets
let socketClient = socketio.listen(app.server);
app.set('socketClient', socketClient);

// socketClient.sockets.on('connection', function (socket) {
//   let timerKey;

//   socket.on('authenticate', function(key) {
//     timerKey = key;
//     let timer = new Timer(timerKey, function() {
//       if(timerKey in socket.rooms) {
//         socket.emit('message', "You are already authenticated with this key.");
//       } else {
//         socket.join(timerKey);
//         socket.emit('timer', timer.getTimer());
//       }
//     });
//   });

//   socket.on('startTimer', function () {
//     let timer = new Timer(timerKey, function() {
//       timer.startTimer(socketClient.in(timerKey));
//     });
//   });

//   socket.on('stopTimer', function (description) {
//     let timer = new Timer(timerKey, function() {
//       timer.stopTimer(socketClient.in(timerKey), description);
//     });
//   });

//   socket.on('getTimer', function() {
//     let timer = new Timer(timerKey, function() {
//       socket.emit('timer', timer.getTimer());
//     });
//   });
// });
