var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'cfhs',
  password: 'cfhs',
  port: 3306,
  database: 'cfhs',
  multipleStatements: true
});

exports.getQueryResult = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);
      connection.query(sql, values, (err, rows) => {
        connection.release();
        if (err) return reject(err);
        resolve(rows);
      });
    });
  });
};