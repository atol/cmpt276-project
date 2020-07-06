const express = require('express')
const router = express.Router()
//const db = require('../db')
const bcrypt = require('bcryptjs')
const { Pool } = require('pg');
var pool = new Pool({
  //connectionString: process.env.DATABASE_URL
  connectionString: 'postgres://postgres:root@localhost/authdb',
})
const Joi = require('joi') // this library helps with checking user input info validity
//all stuff prepended by /auth

const schema = Joi.object().keys({
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    password: Joi.string().min(8).required(), //add uppercase etc reqs later, for now min passlength=8
})

router.get('/',(req,res)=>{
    res.send("Routing!")
})

router.post('/signup', async (req,res)=>{
    //page posted to is /auth/signup
    const result = Joi.validate(req.body,schema)
    if(result.error===null){
        //check for duplicate username else it's good and add to db
        try {
            const emailInput = req.body.email
            let email = new String(emailInput)
            email = email.toLowerCase() // ensures all emails stored are stored as lowercase emails
            const hashedPassword=await bcrypt.hash(req.body.password,10)
            console.log(hashedPassword)
            const client = await pool.connect();
            const qResult = await client.query(`select * from users where email=$1`,[email])
            if(qResult.rows && qResult.rows.length>0){
                res.end("duplicate info!")
            }
            else{
                try {
                    await client.query(`INSERT INTO users VALUES ($1, $2)`, [email, hashedPassword])
                    res.send("posted")
                } catch (err) {
                    console.error(err);
                    res.send("err")
                }
            }
            client.release()
        } catch (err) {
            console.error(err)
            res.send("err")
        }
    }
    else{
        res.send("bad signup info")
    }
})

router.post('/login', async (req,res)=>{ //CHANGE IT TO LOGIN STUFF
    const result = Joi.validate(req.body,schema)
    //Checking if valid info inputted
    if(result.error===null){
        //check if username is found in db
        try {
            let email = new String(req.body.email)
            email = email.toLowerCase() // ensures all emails stored are stored as lowercase emails
            const client = await pool.connect();
            const qResult = await client.query(`select password from users where email=$1`,[email])
            if(qResult.rows && qResult.rows.length>0){ //if email found in db
                console.log(dbPassword)
                console.log(req.body.password)
                try{
                    if(await bcrypt.compare(req.body.password,qResult.rows[0].password)){
                        return res.send('Success')
                    } else{
                        res.send('Not Allowed')
                    }
                  } catch (err) {
                    console.log(err)
                    res.send("err")
                }
            }
            else{ // if email not found in db
                res.send("Email not found in db")
            }
            client.release()
        } catch (err) {
            console.log(err)
            res.send("err")
        }
    }
    else{
        res.send("bad login info")
    }
})

module.exports = router;