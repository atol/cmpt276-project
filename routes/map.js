const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('/info', function (req, res) {
    const user = req.session.user_id;
    const name = req.session.user_name;
    const api_key = process.env.API_KEY;
    const map_url = `https://maps.googleapis.com/maps/api/js?key=${api_key}&callback=myMap`
    const json_url = "https://data.international.gc.ca/travel-voyage/index-alpha-eng.json";
    const settings = { method: "Get" };

    fetch(json_url, settings)
        .then(res => res.json())
        .then((json) => {
            res.render('pages/map/info', { logged_in: user, user_name: name, apiurl: map_url, countries: json.data });
        });
});

module.exports = router;