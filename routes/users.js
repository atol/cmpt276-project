const express = require('express');
const router = express.Router();
const validate = require('./validate');
const db = require('../models/db')
const pool = db.pool

const ACCESS = {
    ADMIN: 10,
    MOD: 1,
    BASIC: 0
}

router.get('/', validate.checkAuth, validate.checkRole(ACCESS.ADMIN), function (req, res) {
    var id = 0;
    var getAllUsers = 'SELECT * FROM users WHERE accesslevel = ($1)';
    pool.query(getAllUsers, [id], (error, result) => {
        if (error) {
            console.error(error);
            res.render('pages/error', { message: error });
        }
        var results = { 'rows': result.rows };
        res.render('pages/users/all', results);
    });
});

router.get('/mods', validate.checkAuth, validate.checkRole(ACCESS.ADMIN), function (req, res) {
    var id = 1;
    var getAllMods = 'SELECT * FROM users WHERE accesslevel = ($1)';
    pool.query(getAllMods, [id], (error, result) => {
        if (error) {
            console.error(error);
            res.render('pages/error', { message: error });
        }
        var results = { 'rows': result.rows };
        res.render('pages/users/mods', results);
    });
});

router.get('/:id/edit', validate.checkAuth, validate.checkRole(ACCESS.ADMIN), async (req, res) => {
    var id = req.params.id;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE id=$1', [id]);
        const results = { 'rows': (result) ? result.rows : null };
        res.render('pages/users/edit', results);
        client.release();
    } catch (err) {
        console.error(err);
        res.render('pages/error', { message: err });
    }
});

router.get('/:id/delete', validate.checkAuth, validate.checkRole(ACCESS.ADMIN), async (req, res) => {
    var id = req.params.id;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE id=$1', [id]);
        const results = { 'results': (result) ? result.rows : null };
        await client.query('DELETE FROM users WHERE id=$1', [id]);
        res.render('pages/users/delete', results);
        client.release();
    } catch (err) {
        console.error(err);
        res.render('pages/error', { message: err });
    }
})

router.post('/:id/update', async (req, res) => {
    var id = req.body.id;
    var name = req.body.name;
    var email = req.body.email;
    var access = req.body.access;
    try {
        const client = await pool.connect();
        await client.query('UPDATE users SET name = $2, email = $3, accesslevel = $4 WHERE id = $1', [id, name, email, access]);
        res.redirect('/dashboard/admin');
        client.release();
    } catch (err) {
        console.error(err);
        res.render('pages/error', { message: err });
    }
});

module.exports = router;