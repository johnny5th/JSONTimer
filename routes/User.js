const config = require('../config/config');
const express = require('express');
const router = express.Router();
const User = require('../app/User');
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.post('/create',
  function(req, res) {
    User.create(req.body.email, req.body.password, (err, user) => {
      if(err) return res.status(405).send(err);

      // Generate token
      let token = jwt.sign({
        id: user.id,
      }, config.jwt_key, {
        expiresIn: '2h',
      });

      res.json({
        token: token,
      });
    });
  }
);

router.post('/forgotpassword', (req, res, next) => {
  let email = req.body.email ? req.body.email : '';

  User.emailToken(email, (err) => {
    if (err) return res.status(405).send(err);
    return res.send('OK.');
  });
});

router.post('/resetpassword', (req, res, next) => {
  let password = req.body.password ? req.body.password : '';

  // Authenticate to get list
  return passport.authenticate('jwt', { session: false}, (err, user) => {
    if (err) return res.status(405).send(err);
    if (!user) return res.status(405).send('Must provide user auth token.');

    user.resetPassword(password, (err) => {
      if (err) return res.status(405).send(err);
      return res.send('OK.');
    });
  })(req, res, next);
});

module.exports = router;
