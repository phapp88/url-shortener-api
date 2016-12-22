var express = require('express');
var mongodb = require('mongodb');
var shortid = require('shortid');
var validUrl = require('valid-url');

var MongoClient = mongodb.MongoClient;
var router = express.Router();
var mLab = process.env.MONGOLAB_URI;

router.get('/', function(req, res) {
    res.render('index');
});

router.get('/new/:url(*)', function(req, res) {
    MongoClient.connect(mLab, function(err, db) {
        if (err) {
            console.log('Unable to connect to server', err);
        } else {
            console.log('Connected to server');
            var url = req.params.url;
            var collection = db.collection('links');
            
            if (validUrl.isUri(url)) {
                var short = 'https://url-shortener1.herokuapp.com/' + shortid.generate().replace(/\D/g, '');
                var newLink = {original_url: url, short_url: short};
                var display = {original_url: url, short_url: short}; // collection.insert will ad an id so create another copy to display
                collection.insert(newLink, function(err, data) {
                    if (err) throw err;
                    res.send(JSON.stringify(display));
                    });
                
            } else {
                res.send('Invalid URL');
            };
        };
        db.close();
    });
});

router.get('/:short', function(req, res) {
    MongoClient.connect(mLab, function(err, db) {
        if (err) {
            console.log('Unable to connect to server', err);
        } else {
            console.log('Connected to server');
            var short_url = 'https://url-shortener1.herokuapp.com/' + req.params.short;
            var collection = db.collection('links');
            collection.findOne({short_url: short_url}, function(err, result) {
                if (err) throw err;
                if (result != null) {
                    res.redirect(result.original_url);
                } else {
                    res.send('This url is not in the database.')
                }
            });
        };
        db.close();
    });
});

module.exports = router;