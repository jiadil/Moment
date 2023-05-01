const user = require('../models/user');

//register
module.exports.renderRegister = (req, res) => {
    res.render("users/register");
};
module.exports.register = async (req, res, next) => {
    //try-catch block: flash the error in the page
    try {
        const { email, username, password } = req.body;
        const newuser = new user({ email, username });
        const registeredUser = await user.register(newuser, password);
        req.login(registeredUser, err => {
            //don't need to relogin after register
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/moment');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

//login
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};
module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    //keep tracking where the user initially in
    if (req.session.returnTo == '/login' || '/register' || '/' || '/logout'){
        res.redirect("/moment");
    }
    else{
        const redirectUrl = req.session.returnTo || '/moment';
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    }
};

//logout
module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/');
};