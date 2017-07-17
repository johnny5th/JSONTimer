const config = require('../config/config');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../app/User');

passport.use(new GitHubStrategy(
  {
    clientID: config.github_client_id,
    clientSecret: config.github_client_secret,
    callbackURL: 'http://127.0.0.1:8080/api/auth/github/callback',
    scope: ['user:email'],
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate('github', { email: profile.emails[0].value, githubId: profile.id }, (err, user) => {
      return cb(err, user);
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
