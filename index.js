var express = require('express');
var app = express();
var url = require('url');
var request = require('request');
var dateFormat = require('dateformat');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', (process.env.PORT || 9001));

app.get('/', function(req, res){
  res.send('It works, Guy!');
});

app.post('/post', function(req, res){
  // var parsed_url = url.format({
  //   pathname: 'https://api.genius.com/search',
  //   query: {
  //     access_token: process.env.GENIUS_ACCESS,
  //     q: req.body.text
  //   }
  // });

      var now = new Date();
  

    var parsed_url = url.format({
    pathname: 'https://www.10bis.co.il/Restaurants/SearchRestaurants',
    query: {
      deliveryMethod:'Delivery',
      ShowOnlyOpenForDelivery:false,
      id:0,
      pageNum:0,
      pageSize:10,
      ShowOnlyOpenForDelivery:false,
      OrderBy:'Default',
      cuisineType:'',
      CityId:0,
      StreetId:0,
      FilterByKosher:false,
      FilterByBookmark:false,
      FilterByCoupon:false,
      Latitude:0,
      Longitude:0,
      HouseNumber:'',
      CityName:'',
      StreetAddress:'',
      desiredDateAndTime: dateFormat(now, "dd%2Fmm%2Fyyyy+HH%3AMM%3Ass"),
      timestamp:(new Date).getTime(),
      searchPhrase:req.body.text
    }
  });

  console.log(parsed_url);

  request(parsed_url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);

      if (!data || !data.length || data.length < 1){
        var body = {
          response_type: "ephemeral",
          text: 'No Restaurants Found'
        };

        res.send(body);
      }
      
      var returnText = 'Found '+data.length+' restaurants.\n\n';
      for (i = 0; i < data.length; i++) { 
        returnText += '['+(i+1)+'] ' + data[i].RestaurantName + " : https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=" + data[i].RestaurantId + '\n\n';
      }

      var body = {
        response_type: "in_channel",
        text: returnText
      }

      res.send(body);
    } else {
      res.status(400);
      res.send('None shall pass');
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
