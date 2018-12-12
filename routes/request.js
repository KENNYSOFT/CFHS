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
      rows = await db.getQueryResult("SELECT * FROM request JOIN user ON request.URid = user.Uid WHERE Tname = ?;", ["admin"]);
      break;
    case "applicable":
      rows = await db.getQueryResult("SELECT * FROM (SELECT * FROM request JOIN user ON request.URid = user.Uid) A WHERE Tname = ? AND Required_min_count = ? AND Required_max_count = ? AND NOT EXISTS (SELECT * FROM requires B WHERE B.Rid = A.Rid AND NOT EXISTS (SELECT * FROM uses C WHERE B.Lname = C.Lname AND C.UFid = ? AND C.Ulevel >= B.Rlevel));", ["admin", 1, 1, req.session.uid]);
      break;
    case "proceeding":
      rows = await db.getQueryResult("SELECT * FROM request JOIN user ON request.URid = user.Uid WHERE Tname = ?;", [req.session.uid]);
      break;
    case "requested":
      rows = await db.getQueryResult("SELECT * FROM request JOIN user ON request.URid = user.Uid WHERE Rid IN (SELECT Rid FROM applies WHERE Tname = ?);", [req.session.uid]);
      break;
  }
  res.render('r_list', {
    session: req.session,
    rows : rows});
}));

router.get('/sort/:legend/:order', wrapper.asyncMiddleware(async (req, res, next) =>  {
  var rows = await db.getQueryResult("SELECT * FROM request JOIN user ON request.URid = user.Uid ORDER BY " + req.params.legend + " " + req.params.order + ";");
  res.render('r_list', {
    session: req.session,
    rows : rows,
    legend: req.params.legend, order: req.params.order});
}));

router.get('/make', wrapper.asyncMiddleware(async (req, res, next) =>  {
  var rows = await db.getQueryResult("SELECT * FROM request JOIN user ON request.URid = user.Uid;", []);
  res.render('r_make', {
    session: req.session
  });
}));

module.exports = router;