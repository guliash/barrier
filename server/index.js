var express = require('express');
var app = express();

var mongo_client = require('mongodb').MongoClient;
var db_url = 'mongodb://localhost:27017/barrier';
var assert = require('assert');

var db_con;

mongo_client.connect(db_url, function(err, db) {
    db_con = db;
    assert.equal(null, err);
    console.log('Connected');
});

var getQuotes = function(db, callback) {
    var cursor = db.collection('quotes').find();
    var res = [];
    cursor.each(function(err, quote) {
        if(quote != null) {
            res.push(quote);
        } else {
            callback(res);
        }
    });
};

app.get('/quotes', function(req, res) {
    getQuotes(db_con, function(quotes) {
        res.json(quotes);
    });
});

app.get('/', function(req, res) {
    res.send('Hello world');
});

app.listen(9003);

console.log('running');
