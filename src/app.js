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
            pageSize: 50,
            OrderBy: "Default",
            cuisineType: "",
            CityId: CITY_ID,
            StreetId: STREET_ID,
            FilterByKosher: false,
            FilterByBookmark: false,
            FilterByCoupon: false,
            searchPhrase: restaurantName,
            Latitude: LAT,
            Longitude: LONG,
            HouseNumber: HOUSE_NUMBER,
            desiredDateAndTime: dateFormat(now, "dd%2Fmm%2Fyyyy+HH%3AMM%3Ass"),
            timestamp: (new Date).getTime()
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

var sortRestaurantsByDistance = function(data) {
        return data.sort(
            function(objectA, objectB) {
                if (!objectA.distanceFromUserInMeters && objectB.distanceFromUserInMeters) return -1;
                if (objectA.distanceFromUserInMeters && !objectB.distanceFromUserInMeters) return 1;
                if (!objectA.distanceFromUserInMeters && !objectB.distanceFromUserInMeters) return 0;

                return (objectA.distanceFromUserInMeters > objectB.distanceFromUserInMeters) ? 1 : ((objectB.distanceFromUserInMeters > objectA.distanceFromUserInMeters) ? -1 : 0);
            }
        );
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

        restaurantName = restaurantName.trim();

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
                    resBody = messageFormatter.getErrorMessage();
                    res.send(resBody);
                    return;
                }

                resBody = messageFormatter.generateResponse(filterByRestaurantName(sortRestaurantsByDistance(data)));
                res.send(resBody);
            } else {
                res.status(400);
                res.send('None shall pass');
            }
        });
    }
};