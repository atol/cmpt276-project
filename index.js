const express = require('express')
const session = require('express-session')
const path = require('path')
const volleyball = require('volleyball')
const auth = require('./auth')
const db = require('./db')

const PORT = process.env.PORT || 5000
const pool = db.pool

const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))
app.use(volleyball)
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret: 'shhhhhhhh', // sign session ID cookie
    resave: false,
    saveUninitialized: true
}))
app.use('/auth',auth) //prepends things in auth/index.js with /auth

app.get('/', (req, res) => res.redirect('/homePage.html'))

app.get('/basic_user', checkAuth, function (req, res) {
    var name = req.session.uname;
    res.render('pages/basic_user', {uname: name});
});

app.get('/mod', checkAuth, function (req, res) {
    var name = req.session.uname;
    res.render('pages/mod', {uname: name});
});

app.get('/admin', checkAuth, function (req, res) {
    var name = req.session.uname;
    res.render('pages/admin', {uname: name});
});

app.get('/users', checkAuth, function (req, res) {
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

app.get('/allmods', checkAuth, function (req, res) {
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

function checkAuth(req, res, next) {
    if (!req.session.user_id) {
        res.send('You are not authorized to view this page');
    } else {
        next();
    }
}

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
