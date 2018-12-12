var express = require('express');
var router = express.Router();
var wrapper = require('../modules/wrapper');
var db = require('../modules/db');

router.get('/list', wrapper.asyncMiddleware(async (req, res, next) =>  {
  var rows = await db.getQueryResult("SELECT * from request", []);
  res.render('r_list', {
      session: req.session,
      rows : rows});
}));

router.get('/make', wrapper.asyncMiddleware(async (req, res, next) =>  {
    var rows = await db.getQueryResult("SELECT * from request", []);
    res.render('r_make', {
        session: req.session
    });
  }));

router.post('/search', wrapper.asyncMiddleware(async (req, res, next) =>  {
    var rows = await db.getQueryResult("SELECT * from request", []);
    res.render('r_list', {
        session: req.session,
        rows : rows});
  }));

router.post('/sort', wrapper.asyncMiddleware(async (req, res, next) =>  {
    var rows = await db.getQueryResult("SELECT * from request", []);
    res.render('r_list', {
        session: req.session,
        rows : rows});
  }));


module.exports = router;