var express = require('express');
var router = express.Router();
var wrapper = require('../modules/wrapper');
var db = require('../modules/db');

var multer = require('multer');
var upload = multer({dest: 'uploads/'});
var fs = require('fs');

/* GET profile page. */
router.get('/modify', wrapper.asyncMiddleware(async (req, res, next) => {
  var row = await db.getQueryResult('SELECT * FROM user JOIN user_free ON user.Uid = user_free.UFid WHERE Uid = ?;', [req.session.uid]);
  if (req.session.utype === 1) res.render('free_profile_modify', {session: req.session, row: row});
  else res.status(403).end();
  res.end();
}));

router.post('/modify', upload.any(), wrapper.asyncMiddleware(async (req, res, next) => {
  var sess = req.session;
  var files = req.files;
  //sess.uid = "user20001";//
  var pid = (await db.getQueryResult('INSERT INTO portfolio(Portfoliotype, UFid) VALUES (2, ?); SELECT LAST_INSERT_ID();', [sess.uid]))[1][0]["LAST_INSERT_ID()"];
  await db.getQueryResult('INSERT INTO outer_portfolio(POid) VALUES (?);', [pid]);
  for(var i = 0; i < files.length; ++i)
  {
    await db.getQueryResult('INSERT INTO file(Fpath, POid) VALUES (?, ?);', [files[i].path, pid]);
  }
  //await db.getQueryResult('UPDATE user (Name,Password) VALUES(?,?) WHERE Uid=?;', [req.body.name, req.body.pwd,sess.uid]);
  await db.getQueryResult('UPDATE user SET Name=?,Password=password(?) WHERE Uid=?;', [req.body.name, req.body.pwd,sess.uid]);
  await db.getQueryResult('UPDATE user_free SET Pnumber=?, age=?, Career_year=?, Major=? WHERE UFid=?;', [req.body.Pnumber,req.body.age,req.body.career_year, req.body.major,  sess.uid]);
  //await db.getQueryResult('UPDATE user_free (Pnumber,age,Career_year,Major) VALUES(?,?,?,?) WHERE UFid=?;', [req.body.Pnumber,req.body.age,req.body.career_year, req.body.major,  sess.uid]);
  for (var i = 1; i <= req.body.langcnt; ++i)
  {
      await db.getQueryResult('UPDATE uses(Ulevel, UFid, Lname) VALUES (?, ?, ?);', [req.body["language_level_" + i], sess.uid, req.body["language_name_" + i]]);
  }
  res.render('finish', {session: req.session, finished: "정보 수정"});
}));

module.exports = router;
