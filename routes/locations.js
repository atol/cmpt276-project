const express = require('express')
const router = express.Router()
const db = require('../models/db')
const pool = db.pool
const http = require('http').createServer(router);
const io = require('socket.io')(http);

io.on('connection', async (socket) => {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM location');
    io.to(socket.id).emit('locations', JSON.stringify(result.rows));
})

router.get('/', function (req, res) {
    var name = req.session.user_name;
    const api_key = process.env.GMAPS_API;
    const map_url = `https://maps.googleapis.com/maps/api/js?key=${api_key}&callback=myMap`
    res.render('pages/map/markers', { user_name: name, apiurl: map_url },);
});

router.post('/add', async (req, res) => {
    const user_id = req.session.user_id;
    const { lat, lng } = req.body;

    const client = await pool.connect();
    await client.query(`
        INSERT INTO location (user_id, lat, lng)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id)
        DO UPDATE SET lat=$2, lng=$3
    `, [user_id, lat, lng]);

    const result = await client.query('SELECT * FROM location');
    io.emit('locations', JSON.stringify(result.rows));
})

module.exports = router;