const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('/', async (req, res) => {
    const user = req.session.user_id;
    res.render('pages/news/articles', { logged_in: user })
});

router.get('/article/:top', async (req, res) => {
    const topic = req.params.top;
    const apiKey = process.env.NEWS_API;
    const url = `https://newsapi.org/v2/top-headlines?country=${topic}&apiKey=${apiKey}`
    const resu = await fetch(url);
    const json = await resu.json();
    res.json(json);

});

module.exports = router;