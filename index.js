var express = require('express');
var app = express();
<<<<<<< HEAD
var botApp = require('./src/app.js');
=======
var botApp = require('./app.js');
>>>>>>> 763ebeef68fb4e142d3a50f48c5527d9a6e3bdb9

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', (process.env.PORT || 9001));

app.get('/', function(req, res) {
    res.send('Sanity passed!');
});

<<<<<<< HEAD
app.post('/post', function(req, res) {
    botApp.process(req, res);
=======
app.post('/post', function(req, res){
  botApp.process(req, res);
>>>>>>> 763ebeef68fb4e142d3a50f48c5527d9a6e3bdb9
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});