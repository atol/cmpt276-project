const express = require('express');
const router = express.Router();
const validate = require('./validate');
const db = require('../models/db')
const pool = db.pool


router.get('/', validate.checkAuth, async (req, res) => {
    var id = req.session.user_id;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE id=$1', [id]);
        const results = { 'rows': (result) ? result.rows : null };
        res.render('pages/profile/view', results);
        client.release();
    } catch (err) {
        console.error(err);
        res.render('pages/error', { message: err });
    }
});

router.get('/edit', validate.checkAuth, async (req, res) => {
    var id = req.session.user_id;
    var name = req.session.user_name;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE id=$1', [id]);
        const results = { 'rows': (result) ? result.rows : null };
        res.render('pages/profile/edit', results);
        client.release();
    } catch (err) {
        console.error(err);
        res.render('pages/error', { message: err });
    }
});

router.post('/update', async (req, res) => {
    var id = req.session.user_id;
    var name = req.body.name;
    var email = req.body.email;
    try {
        const client = await pool.connect();
        await client.query('UPDATE users SET name = $2, email = $3 WHERE id = $1', [id, name, email]);
        res.redirect('/profile');
        client.release();
    } catch (err) {
        console.error(err);
        res.render('pages/error', { message: err });
    }
});

module.exports = router;