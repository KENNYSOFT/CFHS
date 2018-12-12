var express = require('express');
var router = express.Router();
var wrapper = require('../modules/wrapper');
var db = require('../modules/db');

/* GET register page. */
router.get('/list', wrapper.asyncMiddleware(async (req, res, next) =>  {
  var rows = await db.getQueryResult("SELECT * FROM team;", []);
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
  await db.getQueryResult("INSERT INTO team(Tname, Leader_id, Solo) VALUES (?, ?, ?);", [req.body.t_name, req.session.Uid, 0]);
  res.render('finish', {session: req.session, finished: "팀 생성"});
}));

router.get('/selected_list', wrapper.asyncMiddleware(async (req, res, next) =>  {
  var rows = await db.getQueryResult("SELECT * FROM team;", []);
  res.render('t_make', {
    session: req.session,
    rows : rows});
}));

module.exports = router;
