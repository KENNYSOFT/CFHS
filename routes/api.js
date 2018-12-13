var express = require('express');
var router = express.Router();
var wrapper = require('../modules/wrapper');
var db = require('../modules/db');

router.post('/login', wrapper.asyncMiddleware(async (req, res, next) => {
  var sess = req.session;
  var rows = await db.getQueryResult('SELECT * FROM user WHERE Uid = ? AND Password = PASSWORD(?);', [req.body.id, req.body.password]);
  if (rows.length === 0) sess.message = 'login_fail';
  else
  {
    sess.uid = rows[0].Uid;
    sess.uname = rows[0].Name;
    sess.tname = rows[0].Uid;
    sess.utype = rows[0].Usertype;
    sess.message = 'login_success';
  }
  res.writeHead(302, {'Location': '/'});
  res.end();
}));

router.get('/logout', function (req, res, next) {
  var sess = req.session;
  sess.uid = undefined;
  sess.uname = undefined;
  sess.utype = undefined;
  sess.tname = undefined;
  sess.message = 'logout_success';
  res.writeHead(302, {'Location': '/'});
  res.end();
});

module.exports = router;
