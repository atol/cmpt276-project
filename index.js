const express = require('express')
const session = require('express-session')
const path = require('path')
var cors = require('cors')
const volleyball = require('volleyball')
const MapboxClient = require('mapbox/lib/services/geocoding')
const auth = require('./auth')
const db = require('./db')
const friends = require('./friends')
const logger = require('morgan');
//var cors = require('cors')
const {getAdvisories, getInfo} = require('./scraper');
const reviews= require('./reviews')
const fetch = require('node-fetch');
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
//app.use("/",cors())
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'shhhhhhhh', // sign session ID cookie
    resave: false,
    saveUninitialized: true
}))
app.use('/auth', auth) //prepends things in auth/index.js with /auth
app.use('/friends', friends)
app.use('/reviews', reviews)

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
app.get('/addItineries', checkAuth, async (req, res) => {
    const user_id = req.session.user_id;
    const name = req.session.uname;
    try {
        const client = await pool.connect();
        const qResult = await client.query(`select * from tripinfo where user_id=$1`, [user_id])
        client.release()
        if (qResult.rows && qResult.rows.length > 0) {
            var results = { 'rows': qResult.rows };
            console.log(qResult.rows[0].startdate)
            res.render('pages/addItineries', results);
        }
        else {
            res.render('pages/travelInformationEmpty', results)
        }
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})
// app.get('/viewTripInformation', checkAuth, function (req, res) {
//     var name = req.session.uname;
//     const api_key = process.env.API_KEY;
//     const map_url = `https://maps.googleapis.com/maps/api/js?key=${api_key}&callback=initMap&libraries=&v=weekly`
//     res.render('pages/viewTripInformation', { uname: name, apiurl: map_url },);
// });
//get the travel trip information 
app.get('/viewTripInformation', checkAuth, async (req, res) => {
    const user_id = req.session.user_id;
    const name = req.session.uname;
    try {
        const mClient = new MapboxClient('pk.eyJ1IjoibXNjMjgiLCJhIjoiY2tkZTJpaWEyMWwzaTMxcGc4cjB1a3V3eSJ9.htLirZodkFX4l0mFDySW6g')
        const client = await pool.connect();
        const qResult = await client.query(`select * from tripinfo where user_id=$1`, [user_id])
        client.release()
        if (qResult.rows && qResult.rows.length > 0) {
            var results = { 'rows': qResult.rows };
            for(var i=0;i<results.rows.length;i++){
                await mClient.geocodeForward(results.rows[i].origin)
                .then(async function(res) {
                // res is the http response, including: status, headers and entity properties
                    var data = res.entity; // data is the geocoding result as parsed JSON
                    var pos=data.features[0].center
                    var longitude = pos[0]
                    var latitude = pos[1]
                    //console.log("Origin Position for row with id"+results.rows[i].trip_id+" is :"+pos)
                    results.rows[i].originLongitude=longitude
                    results.rows[i].originLatitude=latitude
                })
                .catch(function(err) {
                    console.log(err)
                    res.send("err")
                });
                await mClient.geocodeForward(results.rows[i].destination)
                .then(async function(res) {
                // res is the http response, including: status, headers and entity properties
                    var data = res.entity; // data is the geocoding result as parsed JSON
                    var pos=data.features[0].center
                    var longitude = pos[0]
                    var latitude = pos[1]
                    //console.log("Destination Position for row with id"+results.rows[i].trip_id+" is :"+pos)
                    results.rows[i].destLongitude=longitude
                    results.rows[i].destLatitude=latitude
                 })
                .catch(function(err) {
                    console.log(err)
                    res.send("err")
                }); 
                //console.log(JSON.stringify(r)) 
            }
            res.render('pages/viewTripInformation', results);
        }
        else {
            res.render('pages/travelInformationEmpty', results)
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
    const destination = req.body.destination;
    const description = req.body.description;
    const origin = req.body.origin;
    try {
        const client = await pool.connect();
        await client.query(`INSERT INTO tripinfo(user_id, tripname, startdate, enddate, destination, description,origin) VALUES($1,$2,$3,$4,$5,$6,$7)`, [user_id, tripname, startdate, enddate, destination, description,origin])
        client.release()
        res.redirect('/viewTripInformation')
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})
//delete exisiting travel information 
app.post('/deleteTrip/:id', checkAuth, async (req, res) => {
    const trip_id = req.params.id
    try {
        const client = await pool.connect();
        await client.query(`DELETE FROM tripinfo WHERE trip_id=$1`, [trip_id])
        client.release()
        res.redirect('/viewTripInformation')
    } catch (err) {
        console.error(err)
        res.send("err")
    }
});
// app.post('/edit', (req, res) => {
//     var user_data = [req.body.tripname, req.body.startdate, req.body.enddate, req.body.destination, req.body.description];
//     let updateUserQuery = "UPDATE tripinfo SET tripname = $1, startdate = $2, enddate = $3, destination = $4 WHERE description =$5";
//     pool.query(updateUserQuery, user_data, (err, results) => {
//         if (err) throw err;
//         res.render('pages/viewTripInformation')
//     })
// })
app.post('/edit', checkAuth, async (req, res) => {
    const user_id = req.session.user_id;
    const tripname = req.body.tripname;
    const startdate = req.body.startdate;
    const enddate = req.body.enddate;
    const origin = req.body.origin
    const destination = req.body.destination;
    const description = req.body.description;
    try {
        const client = await pool.connect();
        await client.query(`UPDATE tripinfo SET user_id = $1, tripname = $2, startdate = $3, enddate = $4, destination = $5, origin=$6 WHERE description =$7`, [user_id, tripname, startdate, enddate, destination,origin,description])
        client.release()
        res.redirect('/viewTripInformation')
    } catch (err) {
        console.error(err)
        res.send("err")
    }
})
app.get('/dashboard', checkAuth, function (req, res) {
    var name = req.session.uname;
    var access = req.session.user_access;
    res.render('pages/basic_user', { uname: name, user_access: access });
});

app.get('/info_map', checkAuth, function (req, res) {
    var name = req.session.uname;
    const api_key = process.env.API_KEY;
    const map_url = `https://maps.googleapis.com/maps/api/js?key=${api_key}&callback=myMap`
    const json_url = "https://data.international.gc.ca/travel-voyage/index-alpha-eng.json";
    const settings = { method: "Get" };

    fetch(json_url, settings)
        .then(res => res.json())
        .then((json) => {
            res.render('pages/info_map', { uname: name, apiurl: map_url, countries: json.data });
        });
});

app.get('/allusers', checkAuth, function (req, res) {
    var name = req.session.uname;
    const api_key = process.env.API_KEY;
    const map_url = `https://maps.googleapis.com/maps/api/js?key=${api_key}&callback=myMap`
    res.render('pages/allUsersMap', { uname: name, apiurl: map_url },);
});


app.get('/mod', checkAuth, checkRole(ACCESS.MOD), function (req, res) {
    var name = req.session.uname;
    res.render('pages/mod', { uname: name });
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
    const advisories = await getAdvisories();
    res.render('pages/advisories', { logged_in: user, results: advisories });
});

app.get('/destinations/:country', async (req, res) => {
    var user = req.session.user_id;
    var target = req.params.country;
    const info = await getInfo(target);
    res.render('pages/destination', { logged_in: user, results: info });
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

app.post('/', async (req, res) => {
    var id = req.body.id;
    var access = req.body.access;
    console.log(access)
    console.log(id)
    try {
        const client = await pool.connect();
        await client.query('UPDATE USERS SET ACCESSLEVEL = $2 WHERE id = $1',
            [id, access]);
        res.redirect('admin');
        client.release();
    } catch (err) {
        console.error(err);
        res.end(error);
    }
});


app.get('/news', async (req, res) => {
  var user = req.session.user_id;
  var name = req.session.uname;
  res.render('pages/news', { logged_in: user, uname: name })
});

app.post('/done', async (req, res) => {
    var id = req.session.user_id;
    var name = req.body.name;
    var email = req.body.email;
    try {
        const client = await pool.connect();
        await client.query('UPDATE USERS SET NAME = $2, EMAIL = $3 WHERE id = $1',[id, name, email]);
        res.redirect('/admin');
        client.release();
    } catch (err) {
        console.error(err);
        res.end(error);
    }
});

app.get('/users/:id/change_attr', async (req, res) => {
    var id = req.params.id;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE id=$1', [id]);
        const results = { 'rows': (result) ? result.rows : null };
        res.render('pages/change_attr', results);
        client.release();
    } catch (err) {
        console.error(err);
        es.render('errorMessage.html', err);
    }
});


app.get('/profile', async (req, res) => {
    var id = req.session.user_id;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE id=$1', [id]);
        const results = { 'rows': (result) ? result.rows : null };
        res.render('pages/profile', results);
        client.release();
    } catch (err) {
        console.error(err);
        es.render('errorMessage.html', err);
    }
});

app.get('/profile_edit', async (req, res) => {
    var id = req.session.user_id;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE id=$1', [id]);
        const results = { 'rows': (result) ? result.rows : null };
        res.render('pages/profile_edit', results);
        client.release();
    } catch (err) {
        console.error(err);
        es.render('errorMessage.html', err);
    }
});


app.get('/users/:id/delete', async (req, res) => {
    var id = req.params.id;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE id=$1', [id]);
        const results = { 'results': (result) ? result.rows : null };
        await client.query('DELETE FROM users WHERE id=$1', [id]);
        res.render('pages/new_delete', results);
        client.release();
    } catch (err) {
        console.error(err);
        res.render('errorMessage.html', err);
    }
})




const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', async (socket) => {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM location');
    io.to(socket.id).emit('locations', JSON.stringify(result.rows));
})

app.post('/allusers/locations', async (req,res) => {
    const user_id = req.session.user_id;
    const{lat, lng} = req.body;
    // console.log(user_id, lat, lng);

    const client = await pool.connect();
    await client.query(`
        INSERT INTO location (user_id, lat, lng)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id)
        DO UPDATE SET lat=$2, lng=$3
    `, [user_id, lat, lng]);

    const result = await client.query('SELECT * FROM location');
    io.emit('locations', JSON.stringify(result.rows));
    res.send("worked!");
})

http.listen(PORT, () => console.log(`Listening on ${PORT}`))
//module.exports=app
