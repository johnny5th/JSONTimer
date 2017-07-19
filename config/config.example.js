module.exports = {
  api_port: 8080,
  mysql_host: 'localhost',
  mysql_port: 3306,
  mysql_user: 'jsontimer',
  mysql_password: 'jsontimer',
  mysql_database: 'jsontimer',
  jwt_key: '',
  email_settings: {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    from: 'test@test.com',
    auth: {
      user: 'test@test.com',
      pass: 'test',
    },
  },
};
