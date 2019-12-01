var express = require('express');
var crypto = require('crypto');
var router = express.Router();

var monk = require('monk');
var db = monk('localhost:27017/airline_system');

// Get all user
router.get('/', function(req, res) {
    const collection = db.get('users');
    collection.find({}, function(err, users) {
        if (err) throw err;
        res.json(users);
    });
});

// Add one user
router.post('/', function(req, res) {
    const collection = db.get('users');
    const user = req.body;
    const hash = crypto.createHash('md5');
    hash.update(user.password);

    collection.insert({
        username: user.username,
        password: hash.digest('hex'),
        email: user.email,
        fullname: user.fullname,
        address: user.address,
        phone: user.phone,
        auth: user.auth
    }, function(err, user) {
        if (err) throw err;
        res.json(user);
    });
});

// Get one user
router.get('/:id', function(req, res) {
    const collection = db.get('users');
    collection.findOne({_id: req.params.id}, function(err, user) {
        if (err) throw err;
        res.json(user);
    });
});

// Update one user
router.put('/:id', function(req, res) {
    const collection = db.get('users');
    const user = req.body;
    collection.update({
            _id: req.params.id
        },
        {
            username: user.username,
	        password: user.password,
	        email: user.email,
	        fullname: user.fullname,
	        phone: user.phone,
	        auth: user.auth
        }, function(err, status) {
            if (err) throw err;
            res.json(status);
        });
});

// Check if the username exists
router.get('/username/:username', function(req,res) {
	const collection = db.get('users');
	collection.findOne({username: req.params.username}, function(err, user) {
		if (err) throw err;
        if (user != null) {
            res.json({existed: true});
        } else {
            res.json({existed: false});
        }
	});
});

// User sign in
router.post('/signIn', function(req, res) {
    const collection = db.get('users');
    const user = req.body;
    const hash = crypto.createHash('md5');
    hash.update(user.password);

    collection.findOne({
        username: user.username,
        password: hash.digest('hex')
    }, function(err, user) {
        if (err) throw err;
        if (user != null) {
            res.json({status: true, auth: user.auth});
        } else {
            res.json({status: false});
        }
    })
});

module.exports = router;
