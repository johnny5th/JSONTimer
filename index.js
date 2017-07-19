const config = require('./config/config');
const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const passport = require('passport');
const socketio = require('socket.io');
const UserRouter = require('./routes/User');
const AuthRouter = require('./routes/Auth');
const TimerRouter = require('./routes/Timer');

let app = express();
let server = http.Server(app);

app.use(bodyParser.json());
app.use(cors());

// Sockets
let io = socketio.listen(server);
require('./routes/Sockets')(io);
app.use(function(req, res, next) {
  res.io = io;
  next();
});

// Passport
app.use(passport.initialize());
require('./utils/passport');

app.use('/api/user', UserRouter);
app.use('/api/auth', AuthRouter);
app.use('/api/timer', TimerRouter);

server.listen(config.api_port, function() {
  console.log('Listening on port %s', config.api_port);
});
