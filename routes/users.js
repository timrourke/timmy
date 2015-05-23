var User = require('../models/user');

module.exports = function(express, passport) {
  var passport = passport;
  var express = express;
  var router = express.Router();

  function isLoggedIn(err, req, res, next) {
    if (err) return next(err);
    if(req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/');
    }
  }

  function isAdmin(err, req, res, next) {
    if (err) return next(err);
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

  router.put('/profile', isLoggedIn, function(req, res, next) {
    User.findOne({'username': req.body._originalusername }, function(err, user) {
      if (err) {
        console.log('db find error in PUT /profile: ' + err);
      } else if (!user) {
        res.render('error');
      } else {

        user.username = req.body.username;
        user.email = req.body.email;
        
        //Make sure new password matched confirmation password
        if (req.body.newpassword != "" && req.body.confirmpassword != "") {
          if (req.body.newpassword !== req.body.confirmpassword) {
            req.flash('profileMessage', 'Error: please make sure new passwords match.');
            return res.redirect('/users/profile');
          } else {
            user.password = user.generateHash(req.body.newpassword);
          }
        } 

        user.save(function(err) {
          if (err) {
            console.log('db save error in PUT /profile: ' + err);
            res.render('error');
          } else {
            req.flash('profileMessage', 'Changes saved successfully!');
            res.redirect('/users/profile');
          }
        })
      }
    });
  });

  router.get('/edit', isLoggedIn, isAdmin, function(req, res, next) {
    res.send('admin page');
  });

  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  return router;
}
