const express = require('express')
const session = require('express-session')
const path = require('path')
const volleyball = require('volleyball')

const db = require('./models/db')

const index = require('./routes/index');
const dashboard = require('./routes/dashboard');
const destinations = require('./routes/destinations');
const friends = require('./routes/friends');
const itineraries = require('./routes/itineraries');
const map = require('./routes/map');
const news = require('./routes/news');
const profile = require('./routes/profile');
const reviews = require('./routes/reviews');
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
app.use('/itineraries', itineraries)
app.use('/map', map)
app.use('/news', news)
app.use('/profile', profile)
app.use('/reviews', reviews)
app.use('/users', users)

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
