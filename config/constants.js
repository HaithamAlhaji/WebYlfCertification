module.exports = {
  express: {
    port: process.env.PORT || 3000
  },
  mysql: {
    host: process.env.mysql_host,
    username: process.env.mysql_username,
    password: process.env.mysql_password,
    database: process.env.mysql_database
    // host: '127.0.0.1',
    // username: 'root',
    // password: '123123',
    // database: 'db_library'
  }
};
