var express = require('express');
var router = express.Router();
var wrapper = require('../modules/wrapper');
var db = require('../modules/db');

/* GET register page. */
router.get('/list', wrapper.asyncMiddleware(async (req, res, next) =>  {
  var rows;
  if(req.session.utype === 1){
    rows = await db.getQueryResult("SELECT * FROM belongs where UFid = ?;", [req.session.uid]);
  }
  else {
    rows = await db.getQueryResult("SELECT * FROM team;", []);
  }
  res.render('t_list', {
    session: req.session,
    rows : rows});
}));

router.get('/make', wrapper.asyncMiddleware(async (req, res, next) =>  {
  var rows = await db.getQueryResult("SELECT * FROM team;", []);
  res.render('t_make', {
    session: req.session,
    rows : rows});
}));

router.post('/make', wrapper.asyncMiddleware(async (req, res, next) =>  {
  await db.getQueryResult("INSERT INTO team(Tname, Leader_id, Solo) VALUES (?, ?, ?);", [req.body.t_name, req.session.uid, 0]);
  await db.getQueryResult("INSERT INTO belongs(UFid, Tname) VALUES (?, ?);", [req.session.uid, req.body.t_name]);
  res.render('finish', {session: req.session, finished: "팀 생성"});
}));

router.post('/selected_list', wrapper.asyncMiddleware(async (req, res, next) =>  {
  var rows = await db.getQueryResult("SELECT * FROM belongs where Tname = ?;", [req.body.move]);
  res.render('selected_team', {
    session: req.session,
    rows : rows,
    temp_err : false});
}));

router.post('/suggest', wrapper.asyncMiddleware(async (req, res, next) =>  {
  var temp = await db.getQueryResult("SELECT * FROM belongs where UFid = ? and Tname = ?;", [req.body.id, req.body.id2]);
  var temp_err = true;
  if(temp.length === 0){
    var temp = await db.getQueryResult("SELECT * FROM user_free where UFid = ?;", [req.body.id]);  
    if(temp.length !== 0){
      await db.getQueryResult("INSERT INTO belongs(UFid, Tname) VALUES(?, ?);", [req.body.id, req.body.id2]);
      temp_err = false;
    }
  }
  var rows = await db.getQueryResult("SELECT * FROM belongs where Tname = ?;", [req.body.id2]);
  res.render('selected_team', {
    session: req.session,
    rows : rows,
    temp_err : temp_err});
}));


module.exports = router;

