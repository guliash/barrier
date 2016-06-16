var express = require('express');
var app = express();
app.get('/', function(req, res) {
    res.send('Hello world');
});
app.listen(9003);
console.log('running');
