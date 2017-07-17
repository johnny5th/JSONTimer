const moment = require('moment');
const uuid = require('uuid/v4');
let mysqlDB = require('../utils/mysql');

class Timer {

  constructor() {
    this.id = null;
    this.name = null;
    this.apiKey = null;
    this.running = false;
    this.startTime = null;
    this.uid = null;
  }

  load(apiKey, cb) {
    mysqlDB.query('SELECT id, name, running, startTime, uid FROM `timers` WHERE `apiKey` = ?', [apiKey], (error, results) => {
      if (error) {
        return cb(error);
      }

      if(results.length <= 0) {
        return cb('API Key not found.');
      }

      this.id = results[0].id;
      this.name = results[0].name;
      this.apiKey = apiKey;
      this.running = !!results[0].running;
      this.startTime = moment(results[0].startTime);
      this.uid = results[0].uid;

      return cb();
    });
  }

  static loadList(uid, cb) {
    mysqlDB.query('SELECT id, name, apiKey, running, startTime FROM `timers` WHERE `uid` = ?', [uid], (error, results) => {
      if (error) {
        return cb(error, null);
      }

      let timers = [];

      for(let row of results) {
        let timer = new Timer();
        timer.id = row.id;
        timer.name = row.name;
        timer.apiKey = row.apiKey;
        timer.running = !!row.running;
        timer.startTime = moment(row.startTime);
        timer.uid = uid;
        timers.push(timer);
      }

      return cb(null, timers);
    });
  }

  static create(uid, name, cb) {
    Timer._generateKey(apiKey => {
      mysqlDB.query('INSERT INTO `timers` SET `name` = ?, `apiKey` = ?, `uid` = ?', [name, apiKey, uid], (error, result) => {
        if (error) return cb(error, null);

        let timer = new Timer();

        timer.id = result.insertId;
        timer.name = name;
        timer.uid = uid;
        timer.apiKey = apiKey;

        return cb(null, timer);
      });
    });
  }

  // Gets current timer object
  get() {
    return {
      name: this.name,
      apiKey: this.apiKey,
      running: this.running,
      startTime: this.startTime,
      duration: Timer._duration(this.startTime, Timer._now()),
    };
  }

  // Starts timer
  start(sockets) {
    if(this.running)
      this.stop(null);

    this.running = true;
    this.startTime = Timer._now();
    sockets.emit('timer', this.get());
    this.save();
  }

  // Stops timer
  stop(sockets, description) {
    if(this.running)
      this.log(this.startTime, Timer._now(), description);

    this.running = false;
    this.startTime = null;

    if(sockets != null)
      sockets.emit('timer', this.get());
    this.save();
  }

  // Logs time to storage
  log(startTime, stopTime, description) {
    mysqlDB.query('INSERT INTO `log` SET `tid` = ?, `startTime` = ?, `stopTime` = ?, `description` = ?', [this.id, moment(startTime).format('YYYY-MM-DD HH:mm:ss'), moment(stopTime).format('YYYY-MM-DD HH:mm:ss'), description], (error) => {
      if (error) throw error;
    });
  }

  // Saves timer object to persistent storage
  save() {
    mysqlDB.query('UPDATE `timers` SET `running` = ?, `startTime` = ? WHERE `id` = ?', [this.running, moment(this.startTime).format('YYYY-MM-DD HH:mm:ss'), this.id], (error) => {
      if (error) throw error;
    });
  }

  static _now() {
    return moment();
  }

  static _generateKey(cb) {
    let apiKey = uuid();

    mysqlDB.query('SELECT count(id) as count FROM `timers` WHERE `apiKey` = ?', [apiKey], function (error, results) {
      if (error) throw error;

      if(results[0].count == 0) {
        return cb(apiKey);
      }

      return Timer._generateKey(cb);
    });
  }

  static _duration(startTime, stopTime) {
    startTime = moment(startTime);
    stopTime = moment(stopTime);

    return moment.duration(stopTime.diff(startTime));
  }
}

module.exports = Timer;