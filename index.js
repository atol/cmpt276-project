const express = require('express')
const session = require('express-session')
const path = require('path')
const volleyball = require('volleyball')

const db = require('./models/db')
const pool = db.pool

const index = require('./routes/index');
const dashboard = require('./routes/dashboard');
const destinations = require('./routes/destinations');
const friends = require('./routes/friends');
const itineraries = require('./routes/itineraries');
const locations = require('./routes/locations');
const map = require('./routes/map');
const news = require('./routes/news');
const profile = require('./routes/profile');
const reviews = require('./routes/reviews');
const users = require('./routes/users');

require('dotenv').config();

const PORT = process.env.PORT || 5000

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

const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', async (socket) => {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM location');
    io.to(socket.id).emit('locations', JSON.stringify(result.rows));
})

app.use('/', index)
app.use('/dashboard', dashboard)
app.use('/destinations', destinations)
app.use('/friends', friends)
app.use('/itineraries', itineraries)
app.use('/locations', locations)
app.use('/map', map)
app.use('/news', news)
app.use('/profile', profile)
app.use('/reviews', reviews)
app.use('/users', users)

http.listen(PORT, () => console.log(`Listening on ${PORT}`))