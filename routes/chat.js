module.exports = function(express, passport) {
  var passport = passport;
  var express = express;
  var router = express.Router();

  function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/');
    }
  }

  router.get('/', isLoggedIn, function(req, res, next) {
    res.render('chat/chat', { 
        title: 'Timmy - Chat',
        message: req.flash('chatMessage'),
        user: req.user
      });
  });
  return router;
}