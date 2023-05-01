const express = require('express');
const router = express.Router();
const passport = require('passport');

const catchError = require('../Error/catchError');
const users = require("../conrtollers/users");


//new register
router.get('/register', users.renderRegister);
router.post('/register', catchError(users.register));

//login
router.get('/login', users.renderLogin);
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

//logout
router.get('/logout', users.logout);

// router.route('/register')
//     .get(users.renderRegister)
//     .post(catchAsync(users.register));

// router.route('/login')
//     .get(users.renderLogin)
//     .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

// router.get('/logout', users.logout)



module.exports = router;