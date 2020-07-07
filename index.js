const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const volleyball = require('volleyball')
const auth = require('./auth')

const app=express()
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(volleyball)
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.get('/', (req, res) => res.render('pages/index'))
app.use('/auth',auth) //prepends things in auth/index.js with /auth

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
