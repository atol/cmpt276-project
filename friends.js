const express = require('express')
const router = express.Router()
const db = require('./db')
const pool = db.pool
const Joi = require('joi') // this library helps with checking user input info validity

//all stuff prepended by /friends

//Show All friends of user
router.get('/', checkAuth, async (req, res) => {
    const user_id = req.session.user_id
    //console.log(user_id)
    try {
        const client = await pool.connect();
        let qResult = await client.query(`select name from users where id IN (select user_b from friends where user_a=$1 UNION select user_a from friends where user_b=$1)`, [user_id])
        if (qResult.rows && qResult.rows.length > 0) {
            var results = {'rows':qResult.rows};
            res.render('pages/friends', results);
        }
        else {
            res.send("You have no friends :( How sad")
            }
        client.release()
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})

//Request friendship UwU

function checkAuth(req, res, next) {
    if (!req.session.user_id) {
        res.send('Please sign in');
    } else {
        next();
    }
}


module.exports = router;