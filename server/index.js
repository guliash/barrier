var express = require('express');
var app = express();

var mongo_client = require('mongodb').MongoClient;
var db_url = 'mongodb://localhost:27017/barrier';
var assert = require('assert');

var db_con;

function getFromDatabase(db, collectionName, callback, criteria, proj) {
    var cursor = db.collection(collectionName).find(criteria, proj);
    var res = [];
    cursor.each(function(err, obj) {
        if(obj != null) {
            res.push(obj);
        } else {
            callback(res);
        }
    });
}

function getQuotes(db, callback, criteria, proj) {
    getFromDatabase(db, 'quotes', callback, criteria, proj);
}

function getTypes(db, callback, criteria, proj) {
    getFromDatabase(db, 'types', callback, criteria, proj);
}

mongo_client.connect(db_url, function(err, db) {
    db_con = db;
    assert.equal(null, err);
    console.log('connected');
});

app.get('/quotes', function(req, res) {

    var type = req.query.type;
    var criteria = {};

    if(type) {
        criteria.type = type;
    }

    var proj = { _id: 0 };

    getQuotes(db_con, function(quotes) {
        res.json(quotes);
    }, criteria, proj);
});

app.get('/types', function(req, res) {

    var criteria = {};
    var proj = { _id: 0 };

    getTypes(db_con, function(types) {
        res.json(types);
    }, criteria, proj);
});

app.get('/', function(req, res) {
    res.send('Hello world');
});

app.listen(9003);

console.log('running');
