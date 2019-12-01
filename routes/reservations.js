var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('localhost:27017/airline_system');

// Get all reservations
router.get('/', function(req, res) {
    const collection = db.get('reservations');
    collection.find({}, function(err, reservations) {
        if (err) throw err;
        res.json(reservations);
    });
});

// Get one user's reservations
router.get('/:username', function(req, res) {
    const collection = db.get('reservations');
    collection.find({username: req.params.username}, function(err, reservations) {
        if (err) throw err;
        res.json(reservations);
    });
});

// Add one reservation
router.post('/', function(req, res) {
    const collection = db.get('reservations');
    const reservation = req.body;
    collection.insert({
        username : reservation.username,
        flightId : reservation.flightId,
        reservedCount: reservation.reservedCount
    }, function(err, reservation) {
        if (err) throw err;
        res.json(reservation);
    });
});

// Delete one reservation
router.delete('/:id', function (req, res) {
    const collection = db.get('reservations');
    const flight_collection = db.get('flights');
    collection.findOne({_id: req.params.id}, function(err, reservation) {
        if (err) throw err;
        const flightId = reservation.flightId;
        const reservedCount = reservation.reservedCount;
        flight_collection.findOne({_id: flightId}, function (err, flight) {
                flight.reservedCount -= reservedCount;
                if (!flight.available) {
                    flight.available = true;
                }
                flight_collection.update({_id: flightId}, flight, function (err, status) {
                    if (err) throw err;
                })
            }
        );
    });
    collection.remove({_id: req.params.id}, function(err, status) {
        if (err) throw err;
        res.json(status);
    });
});

// Update one reservation
router.put('/:id', function(req, res) {
    const collection = db.get('reservations');
    const reservation = req.body;
    collection.update({
            _id: req.params.id
        },
        {
            flightId: reservation.flightId
        }, function(err, status) {
            if (err) throw err;
            res.json(status);
        });
});


module.exports = router;
