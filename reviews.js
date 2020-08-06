const express = require('express')
const router = express.Router()
const db = require('./db')
const pool = db.pool
//const Joi = require('joi')

router.get('/', checkAuth, async(req, res) => {
    const user_id=req.session.user_id
    try {
        const client = await pool.connect();
        let qResult=await client.query(`select * from reviews where writer_id=$1`,[user_id])
        if (qResult.rows && qResult.rows.length > 0) {
            var results = {'rows':qResult.rows};
            res.render('pages/myReviews', {logged_in:user_id,'rows':qResult.rows});
        }
        else{
            res.render('pages/reviewsResponse',{logged_in:user_id,message:"You haven't written any reviews."})
        }
        client.release()
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})
router.get('/invalidurl', checkAuth, async(req, res) => {
    const user_id=req.session.user_id
    res.render('pages/reviewsResponse',{logged_in:user_id,message:"Please select a Country before writing or viewing a review!"})
})

router.post('/delete/:review_id', checkAuth, async(req, res) => {
    var user_id = req.session.user_id
    const review_id=req.params.review_id
    try {
        const client = await pool.connect();
        await client.query(`delete from reviews where review_id=$1`,[review_id])
        client.release()
        res.render('pages/reviewsResponse',{logged_in:user_id,message:"The selected review has been deleted"})
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})

router.get('/write/:countryName', checkAuth, (req, res) => {
    var user_id = req.session.user_id
    const input_country = req.params.countryName
    res.render('pages/writeReview',{logged_in:user_id,country:input_country})
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
        res.render('pages/reviewsResponse',{logged_in:writer_id,message:"Review added!"})
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})

router.get('/:countryName', checkAuth, async(req, res) => {
    var user = req.session.user_id
    const country = req.params.countryName
    try {
        const client = await pool.connect();
        let qResult = await client.query(`select * from reviews where country=$1`, [country])
        if (qResult.rows && qResult.rows.length > 0) {
            var results = {'rows':qResult.rows};
            res.render('pages/reviews', {logged_in: user,'rows':qResult.rows});
        }
        else {
            res.render('pages/reviewsResponse',{logged_in:user,message:"No one has written a review for this country yet"})
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