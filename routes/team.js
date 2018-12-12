var express = require('express');
var router = express.Router();
var wrapper = require('../modules/wrapper');
var db = require('../modules/db');

/* GET register page. */
router.get('/list', wrapper.asyncMiddleware(async (req, res, next) =>  {
  var rows = await db.getQueryResult("SELECT * from team", []);
  res.render('t_list', {
      session: req.session,
      rows : rows});
}));

router.get('/make', wrapper.asyncMiddleware(async (req, res, next) =>  {
    var rows = await db.getQueryResult("SELECT * from team", []);
    res.render('t_make', {
        session: req.session,
        rows : rows});
  }));

router.get('/selected_list', wrapper.asyncMiddleware(async (req, res, next) =>  {
    var rows = await db.getQueryResult("SELECT * from team", []);
    res.render('t_make', {
        session: req.session,
        rows : rows});
  }));
module.exports = router;
