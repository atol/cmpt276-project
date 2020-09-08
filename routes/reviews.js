const express = require('express')
const router = express.Router()
const validate = require('./validate')
const db = require('../models/db')
const pool = db.pool

router.get('/', validate.checkAuth, async (req, res) => {
    const user_id = req.session.user_id
    try {
        const client = await pool.connect();
        let qResult = await client.query(`SELECT * FROM reviews WHERE writer_id=$1`, [user_id])
        if (qResult.rows && qResult.rows.length > 0) {
            res.render('pages/reviews/myReviews', { logged_in: user_id, 'rows': qResult.rows });
        }
        else {
            res.render('pages/reviews/response', { logged_in: user_id, message: "You haven't written any reviews." })
        }
        client.release()
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})

router.get('/invalid', async (req, res) => {
    const user_id = req.session.user_id
    res.render('pages/reviews/response', { logged_in: user_id, message: "Please select a country before writing or viewing a review!" })
})

router.get('/:countryName', async (req, res) => {
    var user_id = req.session.user_id
    const country = req.params.countryName
    try {
        const client = await pool.connect();
        let qResult = await client.query(`SELECT * FROM reviews WHERE country=$1`, [country])
        if (qResult.rows && qResult.rows.length > 0) {
            res.render('pages/reviews/view', { logged_in: user_id, 'rows': qResult.rows });
        }
        else {
            res.render('pages/reviews/response', { logged_in: user_id, message: "No one has written a review for this country yet." })
        }
        client.release()
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})

router.get('/write/:countryName', validate.checkAuth, (req, res) => {
    var user_id = req.session.user_id
    const input_country = req.params.countryName
    res.render('pages/reviews/write', { logged_in: user_id, country: input_country })
})

router.post('/delete/:review_id', validate.checkAuth, async (req, res) => {
    var user_id = req.session.user_id
    const review_id = req.params.review_id
    try {
        const client = await pool.connect();
        await client.query(`DELETE FROM reviews WHERE review_id=$1`, [review_id])
        client.release()
        res.render('pages/reviews/response', { logged_in: user_id, message: "The selected review has been deleted." })
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})

router.post('/:countryName', validate.checkAuth, async (req, res) => {
    const writer_id = req.session.user_id
    const country = req.params.countryName
    const review_title = req.body.review_title
    const startdate = req.body.startdate
    const enddate = req.body.enddate
    const location = req.body.location
    const description = req.body.description
    try {
        const client = await pool.connect();
        await client.query(
            `INSERT INTO reviews (writer_id, country, review_title, startdate, enddate, location, description) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [writer_id, country, review_title, startdate, enddate, location, description])
        client.release()
        res.render('pages/reviews/response', { logged_in: writer_id, message: "Review added!" })
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})

module.exports = router;