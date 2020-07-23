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
        let qResult = await client.query(`select id,name,email from users where id IN (select user_b from friends where user_a=$1 UNION select user_a from friends where user_b=$1)`, [user_id])
        if (qResult.rows && qResult.rows.length > 0) {
            var results = {'rows':qResult.rows};
            res.render('pages/friends', results);
        }
        else {
            res.render('pages/noFriends');
            }
        client.release()
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})

//Request friendship UwU
router.post('/add',checkAuth, async (req,res)=>{
    const fromUser_id = req.session.user_id
    const toUser_email=req.body.email
    try {
        const client = await pool.connect();
        let qResult = await client.query(`select id from users where email=$1`,[toUser_email]) //getting id 
        if (qResult.rows && qResult.rows.length > 0) {
            const toUser_id = qResult.rows[0].id
            try {
                qResult = await client.query(`select * from friends where user_a=$1 and user_b=$2 UNION select * from friends where user_a=$2 and user_b=$1`, [toUser_id,fromUser_id])
                if (qResult.rows && qResult.rows.length > 0) {
                    res.send("You are already friends.")
                }
                else {
                    try{
                        qResult=await client.query(`select * from friendreqs where from_user=$1 and to_user=$2 UNION select * from friendreqs where from_user=$2 and to_user=$1`,[fromUser_id,toUser_id])
                        if (qResult.rows && qResult.rows.length > 0) {
                            res.send("You've already sent this user a friend request, or they've sent you one. Check your friend requests and try again!")
                        }
                        else{
                            try{
                                qResult = await client.query(`insert into friendreqs (from_user, to_user, status) values ($1,$2,$3)`,[fromUser_id,toUser_id,0])
                                res.send("Sent the request!")
                            } catch(err){
                                console.error(err)
                                res.send("err")
                            }
                        }
                    }
                     catch(err){
                        console.error(err)
                        res.send("err")
                    }
                }
            } catch (err) {
                console.error(err)
                res.send("err")
            }
        }
        else {
            res.send("This user isn't registered. Please try again.")
            }
        client.release()
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})

router.post('/delete/:id', checkAuth, async (req, res) => {
    const user_id = req.session.user_id
    const otherUser_id=req.params.id
    try {
        const client = await pool.connect();
        await client.query(`delete from friends where (user_a=$1 and user_b=$2) OR (user_a=$2 and user_b=$1)`, [user_id,otherUser_id])
        res.send("Friend successfully deleted.")
        client.release()
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})


router.get('/friendreqs/sent', checkAuth, async (req, res) => {
    const user_id = req.session.user_id
    //console.log(user_id)
    try {
        const client = await pool.connect();
        let qResult = await client.query(`select name,email from users where id IN (select to_User from friendreqs where from_User=$1 )`, [user_id])
        if (qResult.rows && qResult.rows.length > 0) {
            var results = {'rows':qResult.rows};
            res.render('pages/friendReqsSent', results);
        }
        else {
            res.send("Nothing to show here.")
            }
        client.release()
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})

router.get('/friendreqs/recieved', checkAuth, async (req,res)=>{
    const user_id= req.session.user_id
    try {
        const client = await pool.connect();
        let qResult = await client.query(`select id,name,email from users where id IN (select from_User from friendreqs where to_User=$1 )`, [user_id])
        if (qResult.rows && qResult.rows.length > 0) {
            var results = {'rows':qResult.rows};
            res.render('pages/friendReqsRecieved', results);
        }
        else {
            res.send("You haven't recieved any friend requests.")
            }
        client.release()
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})

router.post('/friendreqs/accept/:id',checkAuth, async (req,res)=>{
    const toUser_id= req.session.user_id
    const fromUser_id= req.params.id
    try {
        const client = await pool.connect();
        await client.query(`delete from friendreqs where from_user=$1 and to_user=$2`, [fromUser_id,toUser_id])
        try {
            await client.query(`insert into friends( user_a, user_b) values ($1,$2)`, [toUser_id,fromUser_id])
            client.release()
            res.send("Friend request accepted!")
        } catch (err) {
            console.error(err)
            res.send("err")
        }
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})
router.post('/friendreqs/decline/:id',checkAuth, async (req,res)=>{
    const toUser_id= req.session.user_id
    const fromUser_id= req.params.id
    try {
        const client = await pool.connect();
        await client.query(`delete from friendreqs where from_user=$1 and to_user=$2`, [fromUser_id,toUser_id])
        res.send("Deleted friend request.")
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