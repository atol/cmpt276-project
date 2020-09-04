const express = require('express');
const router = express.Router();

var scraper = require('../models/scraper');

router.get('/advisories', async (req, res) => {
    var user = req.session.user_id;
    const advisories = await scraper.getAdvisories();
    res.render('pages/destinations/advisories', { logged_in: user, results: advisories });
});

router.get('/:country', async (req, res) => {
    var user = req.session.user_id;
    var target = req.params.country;
    const info = await scraper.getInfo(target);
    res.render('pages/destinations/country', { logged_in: user, results: info });
});

module.exports = router;