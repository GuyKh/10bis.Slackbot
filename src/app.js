var slackMessage = require('./slackMessage.js');
var hipChatMessage = require('./hipChatMessage.js');
var url = require('url');
var dateFormat = require('dateformat');
var request = require('request');

var defaultResponse = "Hi, I'm a 10bis bot, searching for restaurants\n" +
                        "To use me - enter /10bis Restaurant, e.g. '/10bis דיקסי'";

// Constants of Send Address
var CITY_ID = 24;
var STREET_ID = 4298;
var HOUSE_NUMBER = 154;
var LONG = 34.795532;
var LAT = 32.0793166;

var generateRequest = function(restaurantName) {
    var now = new Date();

    var parsed_url = url.format({
        pathname: 'https://www.10bis.co.il/Restaurants/SearchRestaurants',
        query: {
            deliveryMethod: 'Delivery',
            ShowOnlyOpenForDelivery: false,
            id: 0,
            pageNum: 0,
            pageSize: 10,
            OrderBy: 'Default',
            cuisineType: '',
            CityId: this.CITY_ID, 
            StreetId: this.STREET_ID,
            FilterByKosher: false,
            FilterByBookmark: false,
            FilterByCoupon: false,
            Latitude: this.LAT,
            Longitude: this.LONG,
            HouseNumber: this.HOUSE_NUMBER,
            CityName: '',
            StreetAddress: '',
            desiredDateAndTime: dateFormat(now, "dd%2Fmm%2Fyyyy+HH%3AMM%3Ass"),
            timestamp: (new Date).getTime(),
            searchPhrase: restaurantName
        }
    });

    return parsed_url;
}

var filterByRestaurantName = function(data) {
    var flags = {};
    var filteredRestaurants = data.filter(function(restarant) {
        if (flags[restarant.RestaurantName]) {
            return false;
        }
        flags[restarant.RestaurantName] = true;
        return true;
    });

    return filteredRestaurants;
}

var sortRestaurantsByDistance =  function(data) {
        return data.sort(
            function(a,b) {
                if (!a.distanceFromUserInMeters && b.distanceFromUserInMeters) return -1;
                if (a.distanceFromUserInMeters && !b.distanceFromUserInMeters) return 1;
                if (!a.distanceFromUserInMeters && !b.distanceFromUserInMeters) return 0;
                
                return (a.distanceFromUserInMeters > b.distanceFromUserInMeters) ? 1 : ((b.distanceFromUserInMeters > a.distanceFromUserInMeters) ? -1 : 0);
            }
        );
}

var generateResponse = function(data) {

    var restaurants = filterByRestaurantName(sortRestaurantsByDistance(data));
    var returnText = 'Found ' + restaurants.length + ' restaurants';
    var restaurantText = '';

    restaurants.forEach(function(restaurant, index){
        restaurantText += '[' + (index + 1) + '] ' + restaurant.RestaurantName + " : https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=" + restaurant.RestaurantId + '\n\n';
    });

    return [returnText, restaurantText];
}

var verifyMessage = function(req, formatters) {
    if (!req || !formatters || !(formatters.constructor == Array))
        return null;

    return formatters.find(function(formatter){
        return formatter.isValidMessage(req);
        });
}

module.exports = {
    process: function(req, res) {
        var messageFormatter = verifyMessage(req, [hipChatMessage, slackMessage]);
        if (!messageFormatter){
            res.status(400);
            res.send("Invalid Message");
            return;
        }


        var restaurantName = messageFormatter.getRestaurantName(req);
        var body = "";

        if (!restaurantName) {
            body = messageFormatter.getErrorMessage();
            res.send(body);
            return;
        }

        if(restaurantName.length === 0){ // Behavior for empty command ('/10bis' with no content)
            body = messageFormatter.getSuccessMessage(defaultResponse, "");
            res.send(body);
            return;
        }

        var parsed_url = generateRequest(restaurantName);

        request(parsed_url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);

                var resBody = "";
                if (!data || !data.length || data.length < 1) {
                    resBody = messageFormatter.getBadMessage();
                    res.send(resBody);
                }

                var generatedResponse = generateResponse(data);

                resBody = messageFormatter.getSuccessMessage(generatedResponse[0], generatedResponse[1]);
                res.send(resBody);

            } else {
                res.status(400);
                res.send('None shall pass');
            }
        });
    }
};