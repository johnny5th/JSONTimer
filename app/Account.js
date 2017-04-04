const uuid = require('uuid/v4');
const isemail = require('isemail');

class Account {

  constructor(mysql) {
    this.mysql = mysql;
  }

  create(email, callback) {
    // Check if valid email
    if(!isemail.validate(email)) {
      return callback(false);
    }

    this.generateKey(key => {
      this.mysql.query('INSERT INTO `timerKeys` SET `timerKey` = ?, `email` = ?', [key, email], function (error) {
        if (error) throw error;
      });

      return callback(key);
    });
  }

  generateKey(callback) {
    let key = uuid();

    this.mysql.query('SELECT count(keyid) as count FROM `timerKeys` WHERE `timerKey` = ?', [key], function (error, results) {
      if (error) throw error;

      if(results[0].count == 0) {
        return callback(key);
      }

      return this.generateKey(callback);
    });
  }

}

module.exports = Account;

