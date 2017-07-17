const isemail = require('isemail');
let mysqlDB = require('../utils/mysql');

class User {

  constructor() {
    this.id = null;
    this.email = null;
    this.githubId = null;
  }

  static findOrCreate(type, data, cb) {
    mysqlDB.query('SELECT id, email, githubId FROM `users` WHERE `email` = ?', [data.email], (error, results) => {
      if (error) return cb(error, null);

      if(results.length <= 0) {
        return User.create(data, cb);
      }

      let user = new User();

      user.id = results[0].id;
      user.email = results[0].email;
      user.email = results[0].githubId;

      return cb(null, user);
    });
  }

  static create(data, cb) {
    mysqlDB.query('INSERT INTO `users` SET ?', [data], (error, result) => {
      if (error) return cb(error, null);

      let user = new User();

      user.id = result.insertId;
      user.email = data.email;
      user.email = data.githubId;

      return cb(null, user);
    });
  }

  static getById(id, cb) {
    mysqlDB.query('SELECT email, githubId FROM `users` WHERE `id` = ?', [id], (error, results) => {
      if (error) return cb(error, null);

      if(results.length <= 0) {
        return cb('User not found');
      }

      let user = new User();

      user.id = id;
      user.email = results[0].email;
      user.githubId = results[0].githubId;

      return cb(null, user);
    });
  }

}

module.exports = User;

