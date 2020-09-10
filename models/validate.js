const validate = {
    checkAuth: function (req, res, next) {
        if (!req.session.user_id) {
            res.render('pages/auth/login', { message: 'Please sign in.' });
        } else {
            next();
        }
    },
    checkRole: function (access) {
        return (req, res, next) => {
            if (req.session.user_access < access) {
                res.render('pages/error', { message: 'Permission denied.' });
            } else {
                next();
            }
        }
    }
};

module.exports = validate;