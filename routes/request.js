var express = require('express');
var router = express.Router();
var wrapper = require('../modules/wrapper');
var db = require('../modules/db');

router.get('/list', wrapper.asyncMiddleware(async (req, res, next) =>  {
  var rows = await db.getQueryResult("SELECT * FROM request JOIN user ON request.URid = user.Uid", []);
  res.render('r_list', {
      session: req.session,
      rows : rows});
}));

router.get('/search/:type', wrapper.asyncMiddleware(async (req, res, next) =>  {
  var rows;
  switch (req.params.type)
  {
    case "finding":
      rows = await db.getQueryResult("SELECT * FROM request JOIN user ON request.URid = user.Uid WHERE Tname = 'admin';");
      break;
    case "applicable":
      rows = await db.getQueryResult("SELECT * FROM (SELECT * FROM request JOIN user ON request.URid = user.Uid) A WHERE Tname = 'admin' AND Required_min_count = 1 AND Required_max_count = 1 AND NOT EXISTS (SELECT * FROM requires B WHERE B.Rid = A.Rid AND NOT EXISTS (SELECT * FROM uses C WHERE B.Lname = C.Lname AND C.UFid = ? AND C.Ulevel >= B.Rlevel));", [req.session.uid]);
      break;
    case "proceeding":
      rows = await db.getQueryResult("SELECT * FROM request JOIN user ON request.URid = user.Uid WHERE Tname = ?;", [req.session.uid]);
      break;
    case "requested":
      rows = await db.getQueryResult("SELECT * FROM request JOIN user ON request.URid = user.Uid WHERE Rid IN (SELECT Rid FROM applies WHERE Tname = ?);", [req.session.uid]);
      break;
  }
  res.render('r_list', {session: req.session, rows : rows});
}));

router.get('/sort/:legend/:order', wrapper.asyncMiddleware(async (req, res, next) =>  {
  var rows = await db.getQueryResult("SELECT * FROM request JOIN user ON request.URid = user.Uid ORDER BY " + req.params.legend + " " + req.params.order + ";");
  res.render('r_list', {session: req.session, rows : rows, legend: req.params.legend, order: req.params.order});
}));

router.get('/detail/:Rid', wrapper.asyncMiddleware(async (req, res, next) =>  {
  var rows = await db.getQueryResult("SELECT * FROM request JOIN user ON request.URid = user.Uid WHERE Rid = ?;", [req.params.Rid]);
  var languages = await db.getQueryResult("SELECT * FROM requires JOIN request ON requires.Rid = request.Rid");
  res.render('request_detail', {session: req.session, rows: rows, languages: languages});
}));

router.get('/make', wrapper.asyncMiddleware(async (req, res, next) =>  {
  res.render('r_make', {session: req.session});
}));

router.post('/make', wrapper.asyncMiddleware(async (req, res, next) =>  {
  await db.getQueryResult("INSERT INTO request(Required_min_count, Required_max_count, Start_date, End_date, Start_develop_date, End_develop_date, Price, Worker_score, Required_career_year, Requester_score, Tname, URid) VALUES (?, ?, ?, ?, NULL, NULL, ?, 0, ?, 0, 'admin', ?);"
    ,[req.body.minimum, req.body.maximum, req.body.start, req.body.end, req.body.cost, req.body.career_year, req.session.Uid]);
  res.render('finish', {session: req.session, finished: "의뢰 생성"});
}));

module.exports = router;