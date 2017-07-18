const config = require('../config/config');
const mysql = require('mysql');

let mysqlDB = mysql.createPool({
  connectionLimit: 10,
  host: config.mysql_host,
  port: config.mysql_port,
  user: config.mysql_user,
  password: config.mysql_password,
  database: config.mysql_database,
  dateStrings: true,
});

module.exports = mysqlDB;
