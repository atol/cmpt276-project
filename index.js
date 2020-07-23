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
app.get('/viewTripInformation', checkAuth, (req, res) => {
    var user = req.session.user_id;
    var name = req.session.uname;
    res.render('pages/viewTripInformation', { logged_in: user, uname: name })
})
app.get('/basic_user', checkAuth, (req, res) => {
    var user = req.session.user_id;
    var name = req.session.uname;
    res.render('pages/basic_user', { logged_in: user, uname: name })
})
//get the travel trip information 
app.get('/viewTripInformation', (req, res) => {
    let getTravelInfoQuery = 'SELECT * FROM tripinfo';
    pool.query(getTravelInfoQuery, (err, result) => {
        if (err) {
            throw err;
        }
        var results = { 'rows': result.rows };
        res.render('pages/viewTripInformation', results);
    });
})
//add the travel trip information
app.post('/addTrip', (req, res) => {
    var tripname = req.body.tripname;
    var startdate = req.body.startdate;
    var enddate = req.body.enddate;
    var location = req.body.location;
    var description = req.body.description;
    var arr_info = [tripname, startdate, enddate, location, description];
    // let getUserquery = 'INSERT INTO users SET?';
    let getUserQuery = 'INSERT INTO tripinfo(tripname, startdate, enddate, location, description) VALUES($1, $2, $3, $4, $5)';
    pool.query(getUserQuery, arr_info, (err, result) => {
        if (err) throw err;
        // res.render(`name: ${user_data.name}, age: ${user_data.age}, height: ${user_data.height}, weight: ${user_data.weight}`);
        // res.send(`name: ${user_data.name}, age:${user_data.age}, height:${user_data.height}, weight: ${user_data.weight}`);
        // res.redirect('/'0;
        // res.redirect('/pages/')
        console.log("complete")

        res.render('pages/viewTripInformation')
        // res.send("Saved!");
    })
})
//delete exisiting travel information 
app.post('/delete', (req, res) => {
    var tripname = req.body.tripname;
    // var arr_name = [name];
    let deleteUserQuery = "DELETE FROM person WHERE tripname = $1";
    pool.query(deleteUserQuery, [tripname], (err, results) => {
        if (err) throw err;
        // res.redirect('/success_delete.html');

    })
    // res.send("Saved!");
});

app.get('/dashboard', checkAuth, function (req, res) {
    var name = req.session.uname;
    res.render('pages/basic_user', { uname: name });
});

app.get('/info_map', checkAuth, function (req, res) {
    var name = req.session.uname;
    res.render('pages/info_map', { uname: name });
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
