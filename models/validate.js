const session = require('express-session');

const validate = {
    checkAuth: function (req, res, next) {
        if (!req.session.user_id) {
            res.send('Please sign in');
        } else {
            next();
        }
    },
    checkRole: function (access) {
        return (req, res, next) => {
            if (req.session.user_access < access) {
                res.send('Permission denied');
            } else {
                next();
            }
        }
    }
};

module.exports = validate;