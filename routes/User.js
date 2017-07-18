const config = require('../config/config');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../app/User');
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
        user: user,
        token: token,
      });
    });
  }
);

module.exports = router;
