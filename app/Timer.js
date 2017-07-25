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
      this.startTime = this.running ? moment.utc(results[0].startTime) : null;
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
        timer.startTime = timer.running ? moment.utc(row.startTime) : null;
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
      duration: this.running ? Timer._duration(this.startTime, Timer._now()) : null,
    };
  }

  // Starts timer
  start() {
    if(this.running)
      this.stop(null);

    this.running = true;
    this.startTime = Timer._now();
    this.save();
  }

  // Stops timer
  stop(description, cb) {
    if(this.running) {
      let stopTime = Timer._now();

      this.log(this.startTime, stopTime, description, (error, id) => {
        if(error) return cb(error, null);

        cb(null, {
          id: id,
          startTime: this.startTime,
          stopTime: stopTime,
          description: description,
        });
      });

      this.running = false;
      this.startTime = null;
      this.save();
    } else {
      cb(null, null);
    }
  }

  // Logs time to storage
  log(startTime, stopTime, description, cb) {
    mysqlDB.query('INSERT INTO `log` SET `tid` = ?, `startTime` = ?, `stopTime` = ?, `description` = ?', [this.id, moment.utc(startTime).format('YYYY-MM-DD HH:mm:ss.SSS'), moment.utc(stopTime).format('YYYY-MM-DD HH:mm:ss.SSS'), description], (error, result) => {
      if (error) return cb(error, null);

      return cb(null, result.insertId);
    });
  }

  // Saves timer object to persistent storage
  save() {
    mysqlDB.query('UPDATE `timers` SET `running` = ?, `startTime` = ? WHERE `id` = ?', [this.running, moment.utc(this.startTime).format('YYYY-MM-DD HH:mm:ss.SSS'), this.id], (error) => {
      if (error) throw error;
    });
  }

  edit(name, cb) {
    mysqlDB.query('UPDATE `timers` SET `name` = ? WHERE `id` = ?', [name, this.id], (error) => {
      if (error) return cb(error);

      this.name = name;

      return cb();
    });
  }

  delete(cb) {
    mysqlDB.query('DELETE FROM `timers` WHERE `id` = ?', [this.id], (error) => {
      if (error) {
        return cb(error);
      }

      mysqlDB.query('DELETE FROM `log` WHERE `tid` = ?', [this.id], (error) => {
        if (error) {
          return cb(error);
        }

        return cb();
      });
    });
  }

  getLogs(offset, limit, page, orderBy, cb) {
    //cb(err, logs, totalPages);

    offset = offset + limit*page;

    if(orderBy != 'ASC' && orderBy != 'DESC')
      orderBy = 'ASC';

    mysqlDB.getConnection((error, conn) => {
      if (error) {
        conn.release();
        return cb(error, null, null, null);
      }

      conn.query('SELECT SQL_CALC_FOUND_ROWS `id`, `startTime`, `stopTime`, `description` FROM `log` WHERE tid = ? ORDER BY `log`.`startTime` ' + orderBy + ' LIMIT ? OFFSET ? ', [this.id, limit, offset], (error, results) => {
        if (error) {
          conn.release();
          return cb(error, null, null, null);
        }

        let logs = results.map((log) => {
          return {
            id: log.id,
            startTime: log.startTime,
            stopTime: log.stopTime,
            description: log.description,
          };
        });

        conn.query('SELECT FOUND_ROWS() as count', (error, result) => {
          if (error) {
            conn.release();
            return cb(error, null, null, null);
          }

          let totalPages = Math.ceil(result[0].count / limit);

          cb(null, logs, totalPages);

          conn.release();
        });
      });
    });
  }

  static _now() {
    return moment.utc();
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
    return moment.duration(stopTime.diff(startTime));
  }
}

module.exports = Timer;
