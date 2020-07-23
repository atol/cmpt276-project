const express = require('express')
const session = require('express-session')
const path = require('path')
const volleyball = require('volleyball')
const auth = require('./auth')
const db = require('./db')
const friends = require('./friends')
require('dotenv').config();

const PORT = process.env.PORT || 5000
const pool = db.pool

const ACCESS = {
    ADMIN: 10,
    MOD: 1,
    BASIC: 0
}

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
app.use('/friends',friends)

app.get('/', function (req, res) {
    var user = req.session.user_id;
    res.render('pages/index', {logged_in: user});
});

app.get('/login', (req, res) => res.redirect('/login.html'))

app.get('/signup', (req, res) => res.redirect('/signup.html'))

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/logout.html');
});

app.get('/dashboard', checkAuth, function (req, res) {
    var name = req.session.uname;
    var access = req.session.user_access;
    res.render('pages/basic_user', {uname: name, user_access : access});
});

app.get('/info_map', checkAuth, function (req, res) {
    var name = req.session.uname;
    const api_key = process.env.API_KEY;
    const map_url = `https://maps.googleapis.com/maps/api/js?key=${api_key}&callback=myMap`
    res.render('pages/info_map', {uname: name, apiurl: map_url},);
});

app.get('/mod', checkAuth, checkRole(ACCESS.MOD), function (req, res) {
    var name = req.session.uname;
    res.render('pages/mod', {uname: name});
});

app.get('/admin', checkAuth, checkRole(ACCESS.ADMIN), function (req, res) {
    var name = req.session.uname;
    res.render('pages/admin', {uname: name});
});

app.get('/users', checkAuth, checkRole(ACCESS.ADMIN), function (req, res) {
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

app.get('/allmods', checkAuth, checkRole(ACCESS.ADMIN), function (req, res) {
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

app.get('/advisories', async (req, res) => {
    var user = req.session.user_id;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT country, advisory, updated FROM dest');
        res.render('pages/advisories', {logged_in: user, results : result ? result.rows : null});
        client.release();
    } catch (err) {
        console.log(err)
        res.send("err")
    }
});

app.get('/destination/:country', async (req, res) => {
    var user = req.session.user_id;
    var target = req.params.country;
    console.log(target)
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM dest WHERE country=$1', [target]);
        res.render('pages/destination', {logged_in: user, results : result ? result.rows : null});
        client.release();
    } catch (err) {
        console.log(err)
        res.send("err")
    }
});

function checkAuth(req, res, next) {
    if (!req.session.user_id) {
        res.send('Please sign in');
    } else {
        next();
    }
}

function checkRole(access) {
    return (req, res, next) => {
        if (req.session.user_access < access) {
            res.send('Permission denied');
        } else {
            next();
        }
    }
}

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
