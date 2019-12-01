var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('localhost:27017/airline_system');

// Get all flights
router.get('/', function (req, res) {
    const collection = db.get('flights');
    collection.find({}, function (err, flights) {
        if (err) throw err;
        res.json(flights);
    });
});

// Search and get all flights that meet the requirement
router.get('/search', function (req, res) {
    const collection = db.get('flights');
    const departureCity = req.query.departure;
    const arrivalCity = req.query.arrival;
    const time = req.query.time;
    collection.find({departureCity: departureCity, arrivalCity: arrivalCity, date: time}, function (err, flights) {
        if (err) throw err;
        res.json(flights);
    });
});

// Add one flight
router.post('/', function (req, res) {
    const collection = db.get('flights');
    const flight = req.body;
    collection.insert({
        capacity: flight.capacity,
        price: flight.price,
        departureCity: flight.departureCity,
        arrivalCity: flight.arrivalCity,
        duration: flight.duration,
        takeOffTime: flight.takeOffTime,
        available: flight.available,
        date: flight.date,
        reservedCount: 0
    }, function (err, flight) {
        if (err) throw err;
        res.json(flight);
    });
});

// Get one flight
router.get('/:id', function (req, res) {
    const collection = db.get('flights');
    collection.findOne({_id: req.params.id}, function (err, flight) {
        if (err) throw err;
        res.json(flight);
    });
});

// Update one flight
router.put('/:id', function (req, res) {
    const collection = db.get('flights');
    const flight = req.body;
    if (flight.reservedCount == null) flight.reservedCount = 0;
    collection.update({
            _id: req.params.id
        },
        {
            capacity: flight.capacity,
            price: flight.price,
            departureCity: flight.departureCity,
            arrivalCity: flight.arrivalCity,
            duration: flight.duration,
            takeOffTime: flight.takeOffTime,
            available: flight.available,
            date: flight.date,
            reservedCount: flight.reservedCount
        }, function (err, status) {
            if (err) throw err;
            res.json(status);
        });
});

// Delete one flight
router.delete('/:id', function (req, res) {
    const collection = db.get('flights');
    collection.remove({_id: req.params.id}, function (err, status) {
        if (err) throw err;
        res.json(status);
    });
});

module.exports = router;