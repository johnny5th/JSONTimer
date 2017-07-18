const isemail = require('isemail');
const bcrypt = require('bcrypt');
let mysqlDB = require('../utils/mysql');

class User {

  constructor() {
    this.id = null;
    this.email = null;
  }

  verifyPassword(password, cb) {
    mysqlDB.query('SELECT password FROM `users` WHERE `email` = ?', [this.email], (error, results) => {
      if (error) return cb(error, null);

      if(results.length <= 0) return cb(false);

      if(!bcrypt.compareSync(password, results[0].password)) {
        return cb(false);
      }

      return cb(true);
    });
  }

  static getByEmail(email, cb) {
    if(!isemail.validate(email)) return cb('Not a valid email.', null);

    mysqlDB.query('SELECT id, email FROM `users` WHERE `email` = ?', [email], (error, results) => {
      if (error) return cb(error, null);

      if(results.length <= 0) return cb('User not found.', null);

      let user = new User();

      user.id = results[0].id;
      user.email = results[0].email;

      return cb(null, user);
    });
  }

  static create(email, password, cb) {
    if(!isemail.validate(email)) return cb('Not a valid email.', null);

    bcrypt.hash(password, 10, (err, hash) => {
      if(err) return cb(err.code);

      mysqlDB.query('INSERT INTO `users` SET `email` = ?, `password` = ?', [email, hash], (error, result) => {
        if (error) return cb(error, null);

        let user = new User();

        user.id = result.insertId;
        user.email = email;

        return cb(null, user);
      });
    });
  }

  static getById(id, cb) {
    mysqlDB.query('SELECT email FROM `users` WHERE `id` = ?', [id], (error, results) => {
      if (error) return cb(error, null);

      if(results.length <= 0) {
        return cb('User not found');
      }

      let user = new User();

      user.id = id;
      user.email = results[0].email;

      return cb(null, user);
    });
  }

}

module.exports = User;

