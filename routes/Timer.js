const express = require('express');
const router = express.Router();
const Timer = require('../app/Timer.js');
const passport = require('passport');

router.route('/')
.get((req, res, next) => {
  // Authenticate to get list
  return passport.authenticate('jwt', { session: false}, (err, user) => {
    if (err) return res.status(405).send(err);
    if (!user) return res.status(405).send('Must provide user auth token.');

    // Get list by user id
    Timer.loadList(user.id, (err, list) => {
      res.json(list.map((timer) => timer.get()));
    });
  })(req, res, next);
})
.post((req, res, next) => {
  let name = req.body.name ? req.body.name : '';

  // Authenticate to create timer
  return passport.authenticate('jwt', { session: false}, (err, user) => {
    if (err) return res.status(405).send(err);
    if (!user) return res.status(405).send('Must provide user auth token.');

    Timer.create(user.id, name, (err, timer) => {
      if (err) return res.status(405).send(err);

      res.json(timer.get());
    });
  })(req, res, next);
});

router.param('apiKey', (req, res, next) => {
  // Check if apiKey exists
  req.timer = new Timer();
  req.timer.load(req.params.apiKey, (err) => {
    if (err) res.status(405).send(err);

    next();
  });
});

router.route('/:apiKey')
.get((req, res, next) => {

  res.json(req.timer.get());

  return next();
})
.delete((req, res, next) => {

  // Authenticate to delete timer
  return passport.authenticate('jwt', { session: false}, (err, user) => {
    if (err) return res.status(405).send(err);
    if (!user) return res.status(405).send('Must provide user auth token.');

    req.timer.delete((err) => {
      if(err) {
        res.status(400).send(err);
        return;
      }

      res.status(200).send('OK.');
    });
  })(req, res, next);
})
.patch((req, res, next) => {
  let name = req.body.name ? req.body.name : '';

  // Authenticate to delete timer
  return passport.authenticate('jwt', { session: false}, (err, user) => {
    if (err) return res.status(405).send(err);
    if (!user) return res.status(405).send('Must provide user auth token.');

    req.timer.edit(name, (err) => {
      if(err) {
        res.status(400).send(err);
        return;
      }

      res.json(req.timer.get());
    });
  })(req, res, next);
});

router.post('/:apiKey/start', (req, res, next) => {
  req.timer.start();
  res.io.in(req.params.apiKey).emit('timer', req.timer.get());
  res.json(req.timer.get());

  return next();
});

router.post('/:apiKey/stop', (req, res, next) => {
  if(typeof req.params.description == 'undefined') {
    req.params.description = '';
  }

  req.timer.stop(req.params.description);
  res.io.in(req.params.apiKey).emit('timer', req.timer.get());
  res.send(req.timer.get());

  return next();
});

module.exports = router;
