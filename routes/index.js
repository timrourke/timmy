module.exports = function(express, passport) {
  var passport = passport;
  var express = express;
  var router = express.Router();
  
  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('index', { 
      title: 'Timmy'
    });
  });

  return router;
}
