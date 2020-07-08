const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const volleyball = require('volleyball')
const auth = require('./auth')
const db = require('./db')
const pool = db.pool

const app=express()
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(volleyball)
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.get('/', (req, res) => res.redirect('/homePage.html'))
app.use('/auth',auth) //prepends things in auth/index.js with /auth


app.get('/', (req, res) => res.render('pages/index'))

app.get('/users', (req,res) => {
  var id = 0;
  var getAllUser = 'SELECT * FROM users where accesslevel = ($1)';
  pool.query(getAllUser,[id], (error,result) => {
    if(error){
      res.end(error);
    }
    var results = {'rows':result.rows};
    res.render('pages/users', results);
  });
});

app.get('/allmods', (req,res) => {
  var id = 1;
  var getAllUser = 'SELECT * FROM users where accesslevel = ($1)';
  pool.query(getAllUser,[id], (error,result) => {
    if(error){
      res.end(error);
    }
    var results = {'rows':result.rows};
    res.render('pages/allmods', results);
  });
});


app.listen(PORT, () => console.log(`Listening on ${PORT}`))
