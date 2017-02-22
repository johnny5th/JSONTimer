const moment = require('moment');
const fs = require('fs');

class JsonTimer {

  constructor(sockets) {
    this.sockets = sockets;

    let timerJSON = JSON.parse(fs.readFileSync('timer.json', 'utf8'));

    this.running = timerJSON.running;
    this.startTime = timerJSON.startTime;
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
  startTimer() {
    if(this.running)
      this.stopTimer();

    this.running = 1;
    this.startTime = this.now();

    this.sockets.emit('timerStarted', this.getTimer());
    this.saveTimer();
  }

  // Stops timer
  stopTimer() {
    if(this.running)
      this.logTime(this.startTime, this.now());

    this.running = 0;
    this.startTime = "";

    this.sockets.emit('timerStopped', this.getTimer());
    this.saveTimer();
  }

  // Logs time to storage
  logTime(start, stop) {
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
    fs.writeFile('timer.json', JSON.stringify(this.getTimer()), (err) => {
      if(err) {
        return 'Error saving data';
      }
    });
  }
}

module.exports = JsonTimer;
