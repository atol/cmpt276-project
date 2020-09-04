const express = require('express');
const router = express.Router();

const validate = require('./validate');

const ACCESS = {
    ADMIN: 10,
    MOD: 1,
    BASIC: 0
}

router.get('/', validate.checkAuth, function (req, res) {
    var name = req.session.user_name;
    var access = req.session.user_access;
    res.render('pages/profile/dashboard', { user_name: name, user_access: access });
});

router.get('/admin', validate.checkAuth, validate.checkRole(ACCESS.ADMIN), function (req, res) {
    var name = req.session.user_name;
    res.render('pages/profile/admin', { user_name: name });
});

router.get('/mod', validate.checkAuth, validate.checkRole(ACCESS.MOD), function (req, res) {
    var name = req.session.user_name;
    res.render('pages/profile/mod', { user_name: name });
});

module.exports = router;