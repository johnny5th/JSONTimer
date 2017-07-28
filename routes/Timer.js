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
      if(err) return res.status(400).send(err);

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
      if(err) return res.status(400).send(err);

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

  req.timer.stop(req.params.description, (err, log) => {
    if (err) return res.status(405).send(err);

    res.io.in(req.params.apiKey).emit('timer', req.timer.get());
    res.json(log);

    return next();
  });
});

router.get('/:apiKey/log', (req, res, next) => {
  let offset = req.query.offset ? parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? parseInt(req.query.limit) : 20;
  let page = req.query.page ? parseInt(req.query.page) : 0;
  let sortBy = req.query.sortBy ? req.query.sortBy : 'ASC';

  if(limit > 1000) {
    return res.status(405).send('Cannot have a limit higher than 1000');
  }

  req.timer.getLogs(offset, limit, page, sortBy, (err, logs, totalPages) => {
    if (err) return res.status(405).send(err);

    res.json({
      logs: logs,
      totalPages: totalPages,
    });

    return next();
  });
});

router.route('/:apiKey/log/:id')
.delete((req, res, next) => {
  req.timer.deleteLog(req.params.id, (err) => {
    if(err) return res.status(400).send(err);

    res.status(200).send('OK.');
  });
})
.patch((req, res, next) => {
  let description = req.body.description ? req.body.description : '';
  let stopTime = req.body.stopTime;

  if(!stopTime) return res.status(400).send('stopTime not sent');

  req.timer.editLog(req.params.id, description, stopTime, (err) => {
    if(err) return res.status(400).send(err);

    res.status(200).send('OK.');
  });
});

module.exports = router;
