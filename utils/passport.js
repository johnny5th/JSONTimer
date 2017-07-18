const config = require('../config/config');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../app/User');


passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  function(email, password, cb) {
    User.getByEmail(email, (err, user) => {
      if (err) { return cb(err); }

      user.verifyPassword(password, (valid) => {
        if(valid) return cb(null, user);
        else return cb('Not a valid password.', null);
      });
    });
  }
));

passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    secretOrKey: config.jwt_key,
  },
  function(jwt_payload, cb) {
    User.getById(jwt_payload.id, (err, user) => {
      return cb(err, user);
    });
  }
));
