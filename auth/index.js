const express = require('express')
const router = express.Router()
const db = require('../db')
const Joi = require('joi') // this library helps with checking user input info validity
//all stuff prepended by /auth

const schema = Joi.object().keys({
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    password: Joi.string().min(8).required(), //add uppercase etc reqs later, for now min passlength=8
})

router.get('/',(req,res)=>{
    res.send("Routing!")
})

router.post('/signup',(req,res)=>{
    //page posted to is /auth/signup
    const result = Joi.validate(req.body,schema)
    //res.json(result)
    if(result.error===null){
        //check for duplicate username else it's good and add to db
        //res.send("good")
        const result = db.query(
            `SELECT * FROM users WHERE email=$1`,
             [req.body.email],
             (err, results)=>{
                 if(err){
                     throw err
                 }
                 if(results.rows.length>0){
                     res.send("Email already registered")
                 }
                 else{
                     res.send("posted")
                 }
             })
    }
    else{
        res.send("bad signup info")
    }
})

module.exports = router;