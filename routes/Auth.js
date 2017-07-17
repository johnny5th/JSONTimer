const config = require('../config/config');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.get('/github',
  passport.authenticate('github', {
    scope: ['user:email'],
    display: 'popup',
  })
);

router.get('/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/',
    session: false,
  }),
  generateToken,
  function(req, res) {
    res.json({
      user: req.user,
      token: req.token,
    });
  }
);

function generateToken(req, res, next) {
  req.token = jwt.sign({
    id: req.user.id,
  }, config.jwt_key, {
    expiresIn: '2h',
  });
  next();
}

module.exports = router;
