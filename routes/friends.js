const express = require('express')
const router = express.Router()
const validate = require('./validate')
const db = require('../models/db')
const pool = db.pool

//Show all friends of user
router.get('/', validate.checkAuth, async (req, res) => {
    const user_id = req.session.user_id
    try {
        const client = await pool.connect();
        let qResult = await client.query(`SELECT id, name, email FROM users WHERE id IN (SELECT user_b FROM friends WHERE user_a=$1 UNION SELECT user_a FROM friends WHERE user_b=$1)`, [user_id])
        if (qResult.rows && qResult.rows.length > 0) {
            var results = { 'rows': qResult.rows };
            res.render('pages/friends/all', results);
        }
        else {
            res.render('pages/friends/none');
        }
        client.release()
    } catch (err) {
        console.error(err)
        res.render('pages/error', { message: err })
    }
})

//Request friendship
router.post('/add', validate.checkAuth, async (req, res) => {
    const fromUser_id = req.session.user_id
    const toUser_email = req.body.email
    try {
        const client = await pool.connect();
        let qResult = await client.query(`SELECT id FROM users WHERE email=$1`, [toUser_email]) //getting id 
        if (qResult.rows && qResult.rows.length > 0) {
            const toUser_id = qResult.rows[0].id
            try {
                qResult = await client.query(`SELECT * FROM friends WHERE user_a=$1 AND user_b=$2 UNION SELECT * FROM friends WHERE user_a=$2 AND user_b=$1`, [toUser_id, fromUser_id])
                if (qResult.rows && qResult.rows.length > 0) {
                    res.render('pages/friends/response', { message: "You are already friends." })
                }
                else {
                    try {
                        qResult = await client.query(`SELECT * FROM friendreqs WHERE from_user=$1 AND to_user=$2 UNION SELECT * FROM friendreqs WHERE from_user=$2 AND to_user=$1`, [fromUser_id, toUser_id])
                        if (qResult.rows && qResult.rows.length > 0) {
                            res.render('pages/friends/response', { message: "You've already sent this user a friend request, or they've sent you one. Check your friend requests and try again!" })
                        }
                        else {
                            try {
                                qResult = await client.query(`INSERT INTO friendreqs (from_user, to_user, status) VALUES ($1,$2,$3)`, [fromUser_id, toUser_id, 0])
                                res.render('pages/friends/response', { message: "Sent the request!" })
                            } catch (err) {
                                console.error(err)
                                res.render('pages/error', { message: err })
                            }
                        }
                    }
                    catch (err) {
                        console.error(err);
                        res.render('pages/error', { message: err });
                    }
                }
            } catch (err) {
                console.error(err)
                res.render('pages/error', { message: err })
            }
        }
        else {
            res.render('pages/friends/response', { message: "This user isn't registered. Please try again." })
        }
        client.release()
    } catch (err) {
        console.error(err)
        res.render('pages/error', { message: err })
    }
})

router.post('/delete/:id', validate.checkAuth, async (req, res) => {
    const user_id = req.session.user_id
    const otherUser_id = req.params.id
    try {
        const client = await pool.connect();
        await client.query(`DELETE FROM friends WHERE (user_a=$1 and user_b=$2) OR (user_a=$2 and user_b=$1)`, [user_id, otherUser_id])
        res.render('pages/friends/response', { message: "Friend successfully deleted." })
        client.release()
    } catch (err) {
        console.error(err)
        res.render('pages/error', { message: err })
    }
})

router.get('/requests/sent', validate.checkAuth, async (req, res) => {
    const user_id = req.session.user_id
    try {
        const client = await pool.connect();
        let qResult = await client.query(`SELECT name, email FROM users WHERE id IN (SELECT to_User FROM friendreqs WHERE from_User=$1 )`, [user_id])
        if (qResult.rows && qResult.rows.length > 0) {
            var results = { 'rows': qResult.rows };
            res.render('pages/friends/reqsSent', results);
        }
        else {
            res.render('pages/friends/response', { message: "Nothing to show here." })
        }
        client.release()
    } catch (err) {
        console.error(err)
        res.render('pages/error', { message: err })
    }
})

router.get('/requests/received', validate.checkAuth, async (req, res) => {
    const user_id = req.session.user_id
    try {
        const client = await pool.connect();
        let qResult = await client.query(`SELECT id, name, email FROM users WHERE id IN (SELECT from_User FROM friendreqs WHERE to_User=$1 )`, [user_id])
        if (qResult.rows && qResult.rows.length > 0) {
            var results = { 'rows': qResult.rows };
            res.render('pages/friends/reqsReceived', results);
        }
        else {
            res.render('pages/friends/response', { message: "You haven't received any friend requests." })
        }
        client.release()
    } catch (err) {
        console.error(err)
        res.render('pages/error', { message: err })
    }
})

router.post('/requests/accept/:id', validate.checkAuth, async (req, res) => {
    const toUser_id = req.session.user_id
    const fromUser_id = req.params.id
    try {
        const client = await pool.connect();
        await client.query(`DELETE FROM friendreqs WHERE from_user=$1 AND to_user=$2`, [fromUser_id, toUser_id])
        try {
            await client.query(`INSERT INTO friends( user_a, user_b) VALUES ($1,$2)`, [toUser_id, fromUser_id])
            client.release()
            res.render('pages/friends/response', { message: "Friend request accepted!" })
        } catch (err) {
            console.error(err)
            res.render('pages/error', { message: err })
        }
    } catch (err) {
        console.error(err)
        res.render('pages/error', { message: err })
    }
})

router.post('/requests/decline/:id', validate.checkAuth, async (req, res) => {
    const toUser_id = req.session.user_id
    const fromUser_id = req.params.id
    try {
        const client = await pool.connect();
        await client.query(`DELETE FROM friendreqs WHERE from_user=$1 AND to_user=$2`, [fromUser_id, toUser_id])
        res.render('pages/friends/response', { message: "Deleted friend request." })
    } catch (err) {
        console.error(err)
        res.render('pages/error', { message: err })
    }
})

module.exports = router;