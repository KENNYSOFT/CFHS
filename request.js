var express = require('express');
var router = express.Router();
var wrapper = require('../modules/wrapper');
var db = require('../modules/db');

/* GET register page. */
router.get('/list', wrapper.asyncMiddleware(async (req, res, next) =>  {
  var rows = await db.getQueryResult("SELECT * from request", []);
  res.render('list', {
      session: req.session,
      rows : rows});
}));



module.exports = router;