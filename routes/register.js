var express = require('express');
var router = express.Router();
var wrapper = require('../modules/wrapper');
var db = require('../modules/db');

/* GET register page. */
router.get('/', function(req, res, next) {
  res.render('register', {session: req.session});
});
/*
router.post('/first_step', (req, res) => {
    res.send('respond with a resources');
});
*/

router.post('/first_step', wrapper.asyncMiddleware(async (req, res, next) => {
    var sess = req.session;
    var rows = await db.getQueryResult('SELECT * FROM user WHERE Uid = ?;', [req.body.U_id]);
    if(rows.length != 0) res.render('fail_reg', {session : req.session});
    else{

        if(req.body.user_t == 'free'){
            sess.tempId = req.body.U_id;
            sess.tempName = req.body.name;
            sess.tempPnumber = req.body.Pnumber;
            sess.tempPwd = req.body.pwd;
            sess.tempUserType = req.body.user_t;
            
            res.render('free', {session: req.session});
            

        }

        else {
            db.getQueryResult('INSERT INTO user(Password, Name, Uid, Usertype) VALUES(PASSWORD(?), ?, ?, ?);', [req.body.pwd, req.body.name, req.body.U_id, 2]);
            db.getQueryResult('INSERT INTO user_req(Pnumber, URid) VALUES(?, ?);', [req.body.Pnumber, req.body.U_id]);
            res.render('fin_reg', {session : req.session});
        }
    }

    res.end();
}));


module.exports = router;