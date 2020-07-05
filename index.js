const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const volleyball = require('volleyball')
const auth = require('./auth')

const app=express()
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(volleyball)
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.get('/', (req, res) => res.render('pages/index'))
app.use('/auth',auth) //prepends things in auth/index.js with /auth


function notFound(req, res, next) {
  res.status(404);
  const error = new Error('Not Found - ' + req.originalUrl);
  next(error);
}

function errorHandler(err, req, res, next) {
  res.status(res.statusCode || 500);
  res.json({
    message: err.message,
    stack: err.stack
  });
}

app.use(notFound);
app.use(errorHandler);



app.listen(PORT, () => console.log(`Listening on ${PORT}`))