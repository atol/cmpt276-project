const express = require('express')
const router = express.Router()
const validate = require('../models/validate')
const db = require('../models/db')
const pool = db.pool
const MapboxClient = require('mapbox/lib/services/geocoding')

router.get('/', validate.checkAuth, (req, res) => {
    var user = req.session.user_id;
    var name = req.session.user_name;
    res.render('pages/itineraries/myTravel', { logged_in: user, user_name: name })
})

router.get('/add', validate.checkAuth, async (req, res) => {
    const user_id = req.session.user_id;
    try {
        const client = await pool.connect();
        const qResult = await client.query(`SELECT * FROM tripinfo WHERE user_id=$1`, [user_id])
        client.release()
        if (qResult.rows && qResult.rows.length > 0) {
            var results = { 'rows': qResult.rows };
            res.render('pages/itineraries/add', results);
        }
        else {
            res.render('pages/itineraries/view', results)
        }
    } catch (err) {
        console.error(err)
        res.render('pages/error', { message: err })
    }
})

router.get('/view', validate.checkAuth, async (req, res) => {
    const user_id = req.session.user_id;
    try {
        const mClient = new MapboxClient('pk.eyJ1IjoibXNjMjgiLCJhIjoiY2tkZTJpaWEyMWwzaTMxcGc4cjB1a3V3eSJ9.htLirZodkFX4l0mFDySW6g')
        const client = await pool.connect();
        const qResult = await client.query(`SELECT * FROM tripinfo WHERE user_id=$1`, [user_id])
        client.release()
        if (qResult.rows && qResult.rows.length > 0) {
            var results = { 'rows': qResult.rows };
            for (var i = 0; i < results.rows.length; i++) {
                await mClient.geocodeForward(results.rows[i].origin)
                    .then(async function (res) {
                        // res is the http response, including: status, headers and entity properties
                        var data = res.entity; // data is the geocoding result as parsed JSON
                        var pos = data.features[0].center
                        var longitude = pos[0]
                        var latitude = pos[1]
                        results.rows[i].originLongitude = longitude
                        results.rows[i].originLatitude = latitude
                    })
                    .catch(function (err) {
                        console.log(err)
                        res.render('pages/error', { message: err })
                    });
                await mClient.geocodeForward(results.rows[i].destination)
                    .then(async function (res) {
                        // res is the http response, including: status, headers and entity properties
                        var data = res.entity; // data is the geocoding result as parsed JSON
                        var pos = data.features[0].center
                        var longitude = pos[0]
                        var latitude = pos[1]
                        results.rows[i].destLongitude = longitude
                        results.rows[i].destLatitude = latitude
                    })
                    .catch(function (err) {
                        console.log(err)
                        res.render('pages/error', { message: err })
                    });
            }
            res.render('pages/itineraries/view', results);
        }
        else {
            res.render('pages/itineraries/empty', results)
        }
    } catch (err) {
        console.error(err)
        res.render('pages/error', { message: err })
    }
})

router.post('/add', validate.checkAuth, async (req, res) => {
    const user_id = req.session.user_id;
    const tripname = req.body.tripname;
    const startdate = req.body.startdate;
    const enddate = req.body.enddate;
    const destination = req.body.destination;
    const description = req.body.description;
    const origin = req.body.origin;
    try {
        const client = await pool.connect();
        await client.query(`INSERT INTO tripinfo (user_id, tripname, startdate, enddate, destination, description,origin) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [user_id, tripname, startdate, enddate, destination, description, origin])
        client.release()
        res.redirect('/itineraries/view')
    } catch (err) {
        console.error(err)
        res.render('pages/error', { message: err })
    }
})

router.post('/delete/:id', validate.checkAuth, async (req, res) => {
    const trip_id = req.params.id
    try {
        const client = await pool.connect();
        await client.query(`DELETE FROM tripinfo WHERE trip_id=$1`, [trip_id])
        client.release()
        res.redirect('/itineraries/view')
    } catch (err) {
        console.error(err)
        res.render('pages/error', { message: err })
    }
});

router.post('/edit', validate.checkAuth, async (req, res) => {
    const user_id = req.session.user_id;
    const tripname = req.body.tripname;
    const startdate = req.body.startdate;
    const enddate = req.body.enddate;
    const origin = req.body.origin
    const destination = req.body.destination;
    const description = req.body.description;
    try {
        const client = await pool.connect();
        await client.query(`UPDATE tripinfo SET user_id = $1, tripname = $2, startdate = $3, enddate = $4, destination = $5, origin = $6 WHERE description = $7`, [user_id, tripname, startdate, enddate, destination, origin, description])
        client.release()
        res.redirect('/itineraries/view')
    } catch (err) {
        console.error(err)
        res.render('pages/error', { message: err })
    }
})

module.exports = router;