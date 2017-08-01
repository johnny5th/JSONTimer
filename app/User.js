const config = require('../config/config');
const isemail = require('isemail');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
let mysqlDB = require('../utils/mysql');
const jwt = require('jsonwebtoken');

class User {

  constructor() {
    this.id = null;
    this.email = null;
  }

  resetPassword(password, cb) {
    if(password == '') return cb('Not a valid password.');

    bcrypt.hash(password, 10, (err, hash) => {
      if(err) return cb(err.code);

      mysqlDB.query('UPDATE `users` SET `password` = ? WHERE `id` = ?', [hash, this.id], (error) => {
        if (error) return cb(error);

        return cb(null);
      });
    });
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

  loggedIn() {
    mysqlDB.query('UPDATE `users` SET `loggedIn` = NOW() WHERE `id` = ?', [this.id]);
  }

  static emailToken(email, cb) {
    if(!isemail.validate(email)) return cb('Not a valid email.');

    mysqlDB.query('SELECT id FROM `users` WHERE `email` = ?', [email], (error, results) => {
      if (error) return cb(error);

      if(results.length <= 0) return cb('Email Not Found.');

      let mailer = nodemailer.createTransport(config.email_settings);

      let token = jwt.sign({
        id: results[0].id,
      }, config.jwt_key, {
        expiresIn: '30m',
      });

      let mailOptions = {
        to: email,
        subject: 'JSONTimer Login',
        text: 'Click to Log in: https://jsontimer.com/resetpassword?token=' + token, // plain text body
        html: '<p><a href="https://jsontimer.com/resetpassword?token=' + token + '">Click to Reset Password</a></p>', // html body
      };

      mailOptions.from = config.email_settings.from;

      mailer.sendMail(mailOptions, (err) => {
        if(err) {
          return cb(err);
        }

        return cb();
      });
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
    if(password === '') return cb('Not a valid password.', null);

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

