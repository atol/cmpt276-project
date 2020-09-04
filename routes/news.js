const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const user = req.session.user_id;
    res.render('pages/news/articles', { logged_in: user })
});

router.get('/article/:top', async (req, res) => {
    const topic = req.params.top;
    const apiKey = '54b5776c07464c6db009fdac9d3153b6';
    const url = `https://newsapi.org/v2/top-headlines?country=${topic}&apiKey=${apiKey}`
    const resu = await fetch(url);
    const json = await resu.json();
    res.json(json);

});

module.exports = router;