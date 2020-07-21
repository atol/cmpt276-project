const express = require('express')
const session = require('express-session')
const path = require('path')
const volleyball = require('volleyball')
const auth = require('./auth')
const db = require('./db')

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
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'shhhhhhhh', // sign session ID cookie
    resave: false,
    saveUninitialized: true
}))
app.use('/auth', auth) //prepends things in auth/index.js with /auth

app.get('/', function (req, res) {
    var user = req.session.user_id;
    res.render('pages/index', { logged_in: user });
});

app.get('/login', (req, res) => res.redirect('/login.html'))

app.get('/signup', (req, res) => res.redirect('/signup.html'))

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/logout.html');
});
//for mytravel information
app.get('/myTravel', checkAuth, (req, res) => {
    var user = req.session.user_id;
    var name = req.session.uname;
    res.render('pages/myTravel', { logged_in: user, uname: name })
})
app.get('/dashboard', checkAuth, function (req, res) {
    var name = req.session.uname;
    res.render('pages/basic_user', { uname: name });
});

app.get('/mod', checkAuth, checkRole(ACCESS.MOD), function (req, res) {
    var name = req.session.uname;
    res.render('pages/mod', { uname: name });
});

app.get('/mod_mail', checkAuth, checkRole(ACCESS.MOD), function (req, res) {
    res.render('pages/mod_mail');
});

app.get('/admin', checkAuth, checkRole(ACCESS.ADMIN), function (req, res) {
    var name = req.session.uname;
    res.render('pages/admin', { uname: name });
});

app.get('/users', checkAuth, checkRole(ACCESS.ADMIN), function (req, res) {
    var id = 0;
    var getAllUser = 'SELECT * FROM users where accesslevel = ($1)';
    pool.query(getAllUser, [id], (error, result) => {
        if (error) {
            res.end(error);
        }
        var results = { 'rows': result.rows };
        res.render('pages/users', results);
    });
});

app.get('/allmods', checkAuth, checkRole(ACCESS.ADMIN), function (req, res) {
    var id = 1;
    var getAllUser = 'SELECT * FROM users where accesslevel = ($1)';
    pool.query(getAllUser, [id], (error, result) => {
        if (error) {
            res.end(error);
        }
        var results = { 'rows': result.rows };
        res.render('pages/allmods', results);
    });
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
