var express = require('express');
var router = express.Router();

// Get the homepage
router.get('/', function(req, res) {
  res.render('index', { title: 'Airline Reservation System' });
});

module.exports = router;
