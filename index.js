var express = require('express');
var app = express();
var botApp = require('./src/app.js');


var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', (process.env.PORT || 9001));

app.get('/', function(req, res) {
    res.send('Sanity passed!');
});

app.post('/post', function(req, res) {
    botApp.process(req, res);
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});