const express = require('express')
const session = require('express-session')
const path = require('path')
const volleyball = require('volleyball')
const MapboxClient = require('mapbox/lib/services/geocoding')

const db = require('./models/db')

const index = require('./routes/index');
const dashboard = require('./routes/dashboard');
const destinations = require('./routes/destinations');
const friends = require('./routes/friends');
const map = require('./routes/map');
const news = require('./routes/news');
const profile = require('./routes/profile');
const reviews = require('./reviews');
const users = require('./routes/users');

require('dotenv').config();

const PORT = process.env.PORT || 5000
const pool = db.pool

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

app.use('/', index)
app.use('/dashboard', dashboard)
app.use('/destinations', destinations)
app.use('/friends', friends)
app.use('/map', map)
app.use('/news', news)
app.use('/profile', profile)
app.use('/reviews', reviews)
app.use('/users', users)

//for mytravel information
app.get('/myTravel', checkAuth, (req, res) => {
    var user = req.session.user_id;
    var name = req.session.uname;
    res.render('pages/myTravel', { logged_in: user, uname: name })
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

app.get('/allusers', checkAuth, function (req, res) {
    var name = req.session.uname;
    const api_key = process.env.API_KEY;
    const map_url = `https://maps.googleapis.com/maps/api/js?key=${api_key}&callback=myMap`
    res.render('pages/allUsersMap', { uname: name, apiurl: map_url },);
});

function checkAuth(req, res, next) {
    if (!req.session.user_id) {
        res.send('Please sign in');
    } else {
        next();
    }
}

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
