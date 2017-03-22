const moment = require('moment');

class JsonTimer {

  constructor(timerKey, redis, mysql, callback) {
    this.timerKey = timerKey;
    this.redis = redis;
    this.mysql = mysql;

    this.redis.get(this.timerKey, (err, reply) => {
      let timerJSON;
      if(reply == null) {
        timerJSON = {"running":0,"startTime":""};
      } else {
        timerJSON = JSON.parse(reply);
      }
      this.running = timerJSON.running;
      this.startTime = timerJSON.startTime;

      return callback();
    });
  }

  duration(start, stop) {
    start = moment(start);
    stop = moment(stop);

    return moment.duration(stop.diff(start));
  }

  // Gets current timer object
  getTimer() {
    return {
      running: this.running,
      startTime: this.startTime,
      duration: this.duration(this.startTime, this.now())
    };
  }

  // Starts timer
  startTimer(sockets) {
    if(this.running)
      this.stopTimer(null);

    this.running = 1;
    this.startTime = this.now();
    sockets.emit('timer', this.getTimer());
    this.saveTimer();
  }

  // Stops timer
  stopTimer(sockets, description) {
    if(this.running)
      this.logTime(this.startTime, this.now(), description);

    this.running = 0;
    this.startTime = "";

    if(sockets != null)
      sockets.emit('timer', this.getTimer());
    this.saveTimer();
  }

  // Logs time to storage
  logTime(start, stop, description) {
    let log = {timerKey: this.timerKey, start: moment(start).format('YYYY-MM-DD HH:mm:ss'), stop: moment(stop).format('YYYY-MM-DD HH:mm:ss'), description: description};
    this.mysql.query('INSERT INTO timerLog SET ?', log, function (error) {
      if (error) throw error;
    });
  }

  now() {
    return moment();
  }

  // Saves timer object to persistent storage
  saveTimer() {
    this.redis.set(this.timerKey, JSON.stringify({
      running: this.running,
      startTime: this.startTime
    }));
  }
}

module.exports = JsonTimer;
