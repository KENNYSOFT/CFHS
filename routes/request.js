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
      rows = await db.getQueryResult("SELECT * FROM user_free WHERE UFid = ?;", [req.session.uid]);
      var career_year = rows[0].Career_year;
      rows = await db.getQueryResult("SELECT * FROM (SELECT * FROM request JOIN user ON request.URid = user.Uid) A WHERE Tname = 'admin' AND Required_min_count = 1 AND Required_max_count = 1 AND Required_career_year <= " + career_year + " AND NOT EXISTS (SELECT * FROM requires B WHERE B.Rid = A.Rid AND NOT EXISTS (SELECT * FROM uses C WHERE B.Lname = C.Lname AND C.UFid = ? AND C.Ulevel >= B.Rlevel));", [req.session.uid]);
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
  var rows1 = [];
  
  var temp = await db.getQueryResult("SELECT * FROM request WHERE Rid = ?;", [req.params.Rid]);
  var status = temp[0].Status;

  if(req.session.utype === 2 || req.session.utype === 0){
    rows1 = await db.getQueryResult("SELECT * FROM applies where Rid = ?", req.params.Rid);
  }
  console.log(status);

  res.render('request_detail', {session: req.session, rows: rows, languages: languages, rows1 : rows1, status : status});
}));

router.get('/make', wrapper.asyncMiddleware(async (req, res, next) =>  {
  res.render('r_make', {session: req.session});
}));

router.post('/make', wrapper.asyncMiddleware(async (req, res, next) =>  {
  await db.getQueryResult("INSERT INTO request(Required_min_count, Required_max_count, Start_date, End_date, Start_develop_date, End_develop_date, Price, Worker_score, Required_career_year, Requester_score, Tname, URid) VALUES (?, ?, ?, ?, NULL, NULL, ?, 0, ?, 0, 'admin', ?);"
    ,[req.body.minimum, req.body.maximum, req.body.start, req.body.end, req.body.cost, req.body.career_year, req.session.uid]);
  res.render('finish', {session: req.session, finished: "의뢰 생성"});
}));

router.post('/apply', wrapper.asyncMiddleware(async (req, res, next) =>  {
  console.log(req.body.check_type);
  if(req.body.check_type === '0'){
    await db.getQueryResult("INSERT INTO applies(Tname, Rid) VALUES(?, ?);", [req.session.tname, req.body.rid]);
    await db.getQueryResult("UPDATE request SET Status = 1 where Rid = ?;", [req.body.rid]);
  }
  else {
    await db.getQueryResult("UPDATE request SET Status = 3 where Rid = ?;", [req.body.rid]);
  }
  
  var temp = await db.getQueryResult("SELECT * FROM request WHERE Rid = ?;", [req.body.rid]);

  var rows = await db.getQueryResult("SELECT * FROM request JOIN user ON request.URid = user.Uid WHERE Rid = ?;", [req.body.rid]);
  var languages = await db.getQueryResult("SELECT * FROM requires JOIN request ON requires.Rid = request.Rid");
  var rows1 = [];
  var status = temp[0].Status;

  if(req.session.utype === 2){
    rows1 = await db.getQueryResult("SELECT * FROM applies where Rid = ?;", [req.body.rid]);
  }

  res.render('request_detail', {session: req.session, rows: rows, languages: languages, rows1 : rows1, status : status});
}));




router.post('/accept', wrapper.asyncMiddleware(async (req, res, next) =>  {
  await db.getQueryResult("UPDATE request SET Tname = ?, Start_develop_date = CURDATE(), Status = 2 where Rid = ?;", [req.body.accept, req.body.rid]);
  await db.getQueryResult("Delete from applies where Rid = ?;", [req.body.rid]);

  var rows = await db.getQueryResult("SELECT * FROM request JOIN user ON request.URid = user.Uid WHERE Rid = ?;", [req.body.rid]);
  var languages = await db.getQueryResult("SELECT * FROM requires JOIN request ON requires.Rid = request.Rid");
  var rows1 = [];
  var status;

  var temp = await db.getQueryResult("SELECT * FROM request WHERE Rid = ?;", [req.body.rid]);
  
  var status = temp[0].Status;

  //applies에서 해당 tname 지우고, 현재 시간 기록해서 바꾸고, 맡은 팀 바꾸고

  res.render('request_detail', {session: req.session, rows: rows, languages: languages, rows1 : rows1, status : status});
}));

router.post('/acdec', wrapper.asyncMiddleware(async (req, res, next) =>  {
  if(req.body.acdec == "0"){
    await db.getQueryResult("UPDATE request SET Status = 5, Worker_score = ? where Rid = ?;", [req.body.rate, req.body.rid]);
  }
  else {
    await db.getQueryResult("UPDATE request SET Status = 4, Comment = ? where Rid = ?;", [req.body.com, req.body.rid]);
  }

  var rows = await db.getQueryResult("SELECT * FROM request JOIN user ON request.URid = user.Uid WHERE Rid = ?;", [req.body.rid]);
  var languages = await db.getQueryResult("SELECT * FROM requires JOIN request ON requires.Rid = request.Rid");
  var rows1 = [];
  var status;

  var temp = await db.getQueryResult("SELECT * FROM request WHERE Rid = ?;", [req.body.rid]);
  
  var status = temp[0].Status;

  //applies에서 해당 tname 지우고, 현재 시간 기록해서 바꾸고, 맡은 팀 바꾸고

  res.render('request_detail', {session: req.session, rows: rows, languages: languages, rows1 : rows1, status : status});
}));

router.post('/end', wrapper.asyncMiddleware(async (req, res, next) =>  {
  await db.getQueryResult("UPDATE request SET Status = 6, Requester_score = ?, Comment = '', End_develop_date = CURDATE() where Rid = ?;", [req.body.rate, req.body.rid]);
  res.render('req_end', {session: req.session});
}));

module.exports = router;