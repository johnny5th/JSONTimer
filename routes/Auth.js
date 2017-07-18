const config = require('../config/config');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.post('/',
  function(req, res, next) {
    // Authenticate
    passport.authenticate('local', { session: false}, function(err, user) {
      if(err) return res.status(403).send(err);

      // Generate token
      let token = jwt.sign({
        id: user.id,
      }, config.jwt_key, {
        expiresIn: '2h',
      });

      res.json({
        token: token,
      });
    })(req, res, next);
  }
);

module.exports = router;
