const express = require('express')
const router = express.Router()
const db = require('./db')
const pool = db.pool
//const Joi = require('joi')

router.get('/', checkAuth,  (req, res) => {
    res.send("You can view reviews for every country on our map, or write your own! To get started, click here to be redirected to the map")
})

router.get('/write/:countryName', checkAuth, (req, res) => {
    const input_country = req.params.countryName
    res.render('pages/writeReview',{country:input_country})
})

router.post('/:countryName', checkAuth, async(req, res) => {
    const writer_id=req.session.user_id
    const country = req.params.countryName
    const review_title=req.body.review_title
    const startdate=req.body.startdate
    const enddate=req.body.enddate
    const location=req.body.location
    const description=req.body.description
    try {
        const client = await pool.connect();
        await client.query(
            `insert into reviews (writer_id,country,review_title,startdate,enddate,location,description) values($1,$2,$3,$4,$5,$6,$7)`,
            [writer_id,country,review_title,startdate,enddate,location,description])
        client.release()
        res.send("Review added!")
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})

router.get('/:countryName', checkAuth, async(req, res) => {
    const country = req.params.countryName
    try {
        const client = await pool.connect();
        let qResult = await client.query(`select * from reviews where country=$1`, [country])
        if (qResult.rows && qResult.rows.length > 0) {
            var results = {'rows':qResult.rows};
            res.render('pages/reviews', results);
        }
        else {
            res.send("No reviews for this country yet")
            //res.render('pages/noFriends');
            }
        client.release()
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})



function checkAuth(req, res, next) {
    if (!req.session.user_id) {
        res.send('Please sign in');
    } else {
        next();
    }
}
module.exports = router;