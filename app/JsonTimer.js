const moment = require('moment');
const fs = require('fs');
var redis = require("redis");

class JsonTimer {

  constructor(key, callback) {
    this.timerKey = key;

    this.redis = redis.createClient({host: "localhost", port: 32768});

    this.redis.on("error", function (err) {
      console.log("Error " + err);
    });

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
  stopTimer(sockets) {
    if(this.running)
      this.logTime(this.startTime, this.now());

    this.running = 0;
    this.startTime = "";

    if(sockets != null)
      sockets.emit('timer', this.getTimer());
    this.saveTimer();
  }

  // Logs time to storage
  logTime(start, stop) {
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : 'localhost',
      port     : '32781',
      user     : 'test',
      password : 'test',
      database : 'test'
    });

    connection.connect();

    connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
      if (error) throw error;
      console.log('The solution is: ', results[0].solution);
    });

    connection.en

    fs.readFile('log.json', 'utf8', (err, data) => {
      if(err) {
        console.log(err);
      } else {
        let logData = JSON.parse(data);
        logData.logs.push({start: start, stop: stop, duration: this.duration(start, stop)});
        let json = JSON.stringify(logData, null, 2);
        fs.writeFile('log.json', json, 'utf8', (err) => {
          if(err) {
            console.log(err);
          }
        });
      }
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
