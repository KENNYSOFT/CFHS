var express = require('express');
var router = express.Router();
var wrapper = require('../modules/wrapper');
var db = require('../modules/db');

/* GET register page. */
router.get('/', function(req, res, next) {
  res.render('register', {session: req.session});
});

router.post('/first_step', wrapper.asyncMiddleware(async (req, res, next) => {
    var sess = req.session;
    var rows = await db.getQueryResult('SELECT * FROM user WHERE Uid = ?;', [req.body.U_id]);
    if(rows.length !== 0) res.render('fail_reg', {session : req.session});
    else {

        if(req.body.user_t === 'free'){
            rows = await db.getQueryResult('SELECT * FROM team WHERE Tname = ?;', [req.body.U_id]);
            if(rows.length !== 0) res.render('fail_reg', {session : req.session});

            sess.tempId = req.body.U_id;
            sess.tempName = req.body.name;
            sess.tempPnumber = req.body.Pnumber;
            sess.tempPwd = req.body.pwd;
            sess.tempUserType = req.body.user_t;


            await db.getQueryResult('INSERT INTO user(Password, Name, Uid, Usertype) VALUES (PASSWORD(?), ?, ?, ?);', [req.body.pwd, req.body.name, req.body.U_id, 1]);
            await db.getQueryResult('INSERT INTO team(Tname, Leader_id, Solo) VALUES (?, ?, ?);', [req.body.U_id, req.body.U_id, 1]);
            res.render('free', {session: req.session});
        }

        else {
            await db.getQueryResult('INSERT INTO user(Password, Name, Uid, Usertype) VALUES (PASSWORD(?), ?, ?, ?);', [req.body.pwd, req.body.name, req.body.U_id, 2]);
            await db.getQueryResult('INSERT INTO user_req(Pnumber, URid) VALUES (?, ?);', [req.body.Pnumber, req.body.U_id]);
            res.render('finish', {session: req.session, finished: "의뢰자 회원가입"});
        }
    }

    res.end();
}));

router.post('/second_step_free', wrapper.asyncMiddleware(async (req, res, next) => {
  var sess = req.session;
  await db.getQueryResult('INSERT INTO user_free(Pnumber, Career_year, Major, Age, UFid) VALUES (?, ?, ?, ?, ?);', [sess.tempPnumber, req.body.career_year, req.body.major, req.body.age, sess.tempId]);
  for (var i = 1; i <= req.body.langcnt; ++i)
  {
      await db.getQueryResult('INSERT INTO uses(Ulevel, UFid, Lname) VALUES (?, ?, ?);', [req.body["language_level_" + i], sess.tempId, req.body["language_name_" + i]]);
  }
  res.render('finish', {session: req.session, finished: "프리랜서 회원가입"});
  res.end();
}));

module.exports = router;