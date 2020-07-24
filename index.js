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
app.get('/basic_user', checkAuth, (req, res) => {
    var user = req.session.user_id;
    var name = req.session.uname;
    res.render('pages/basic_user', { logged_in: user, uname: name })
})
//get the travel trip information 
app.get('/viewTripInformation', checkAuth, async (req, res) => {
    const user_id = req.session.user_id;
    const name = req.session.uname;
    try {
        const client = await pool.connect();
        const qResult = await client.query(`select * from tripinfo where user_id=$1`, [user_id])
        client.release()
        if (qResult.rows && qResult.rows.length > 0) {
            var results = { 'rows': qResult.rows };
            console.log(qResult.rows[0].startdate)
            res.render('pages/viewTripInformation', results);
        }
        else {
            res.send("Add some trips, so there is something to display!")
        }
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})
//add the travel trip information
app.post('/addTrip', checkAuth, async (req, res) => {
    const user_id = req.session.user_id;
    const tripname = req.body.tripname;
    const startdate = req.body.startdate;
    const enddate = req.body.enddate;
    const location = req.body.location;
    const description = req.body.description;
    try {
        const client = await pool.connect();
        await client.query(`INSERT INTO tripinfo(user_id, tripname, startdate, enddate, location, description) VALUES($1,$2,$3,$4,$5,$6)`, [user_id, tripname, startdate, enddate, location, description])
        client.release()
        res.redirect('/viewTripInformation')
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})
//delete exisiting travel information 
app.post('/deleteTrip', checkAuth, async (req, res) => {
    const user_id = req.session.user_id
    const tripname = req.body.tripname;
    try {
        const client = await pool.connect();
        await client.query(`DELETE FROM person WHERE tripname = $1 and user_id=$2`, [tripname, user_id])
        client.release()
        res.redirect('/viewTripInformation')
    } catch (err) {
        console.error(err)
        res.send("err")
    }
});
app.post('/edit', (req, res) => {
    var user_data = [req.body.tripname, req.body.startdate, req.body.enddate, req.body.location, req.body.description];
    let updateUserQuery = "UPDATE authdb SET tripname = $1, startdate = $2, enddate = $3, location = $4 WHERE description =$5";
    pool.query(updateUserQuery, user_data, (err, results) => {
        if (err) throw err;
        res.render('pages/viewTripInformation')
    })
})
app.get('/dashboard', checkAuth, function (req, res) {
    var name = req.session.uname;
    var access = req.session.user_access;
    res.render('pages/basic_user', { uname: name, user_access: access });
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

app.get('/advisories', async (req, res) => {
    var user = req.session.user_id;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT country, advisory, updated FROM dest');
        res.render('pages/advisories', { logged_in: user, results: result ? result.rows : null });
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
        res.render('pages/destination', { logged_in: user, results: result ? result.rows : null });
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
