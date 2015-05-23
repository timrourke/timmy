var express = require('express');
var router = express.Router();
var passport = require('passport');

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	} else {
		res.redirect('/');
	}
}

function isAdmin(req, res, next) {
  if (!req.isAuthenticated() || !req.user.admin) {
    req.flash('loginMessage', 'You must first log in, not an admin.');
    res.redirect('/users/login');
  } else {
    next();
  }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', function(req, res, next) {
  res.render('users/login', { 
  	title: 'Timmy - Log In',
  	message: req.flash('loginMessage')
  });
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect : '/users/profile', // redirect to the secure profile section
  failureRedirect : '/users/login', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));

router.get('/signup', function(req, res, next) {
  res.render('users/signup', { 
  	title: 'Timmy - Sign Up',
  	message: req.flash('signupMessage')
  });
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect : '/users/profile', // redirect to the secure profile section
  failureRedirect : '/users/signup', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));

router.get('/profile', isLoggedIn, function(req, res, next) {
  res.render('users/profile', { 
  	title: 'Timmy - Your Profile',
  	message: req.flash('profileMessage'),
  	user: req.user
  });
});

router.get('/edit', isLoggedIn, isAdmin, function(req, res, next) {
  res.send('admin page');
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

module.exports = router;
