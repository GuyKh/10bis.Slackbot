var slackMessage = require('./slackMessage.js');
var hipChatMessage = require('./hipChatMessage.js');
var url = require('url');
var dateFormat = require('dateformat');
var request = require('request');
var winston = require('winston');
winston.level = process.env.LOG_LEVEL;


var defaultResponse = "Hi, I'm a 10bis bot, searching for restaurants\n" +
                        "To use me - enter /10bis Restaurant, e.g. '/10bis דיקסי'";

var TOTAL_KEYWORD = "total";
var DATETIME_FORMAT = 'dd%252Fmm%252Fyyyy%2BHH%253AMM%253Ass';

var generateSearchRequest = function(restaurantName) {
    var now = new Date();

    var parsed_url = url.format({
        pathname: 'https://www.10bis.co.il/Restaurants/SearchRestaurants',
        query: {
            deliveryMethod: 'Delivery',
            ShowOnlyOpenForDelivery: false,
            id: process.env.USER_ID,
            pageNum: 0,
            pageSize: 50,
            OrderBy: "Default",
            cuisineType: "",
            CityId: process.env.CITY_ID,
            StreetId: process.env.STREET_ID,
            FilterByKosher: false,
            FilterByBookmark: false,
            FilterByCoupon: false,
            searchPhrase: restaurantName,
            Latitude: process.env.LAT,
            Longitude: process.env.LONG,
            HouseNumber: process.env.HOUSE_NUMBER,
            desiredDateAndTime: dateFormat(now, DATETIME_FORMAT),
            timestamp: (new Date()).getTime()
        }
    });

    return parsed_url;
};

var generateGetTotalOrdersRequest = function() {
    var now = new Date();

    var parsed_url = url.format({
        pathname: 'https://www.10bis.co.il/Restaurants/SearchRestaurants',
        query: {
            deliveryMethod: 'Delivery',
            ShowOnlyOpenForDelivery: false,
            id: process.env.USER_ID,
            pageNum: 0,
            pageSize: 50,
            OrderBy: 'pool_sum',
            cuisineType: '',
            CityId: process.env.CITY_ID,
            StreetId: process.env.STREET_ID,
            FilterByKosher: false,
            FilterByBookmark: false,
            FilterByCoupon: false,
            searchPhrase: '',
            Latitude: process.env.LAT,
            Longitude: process.env.LONG,
            HouseNumber: process.env.HOUSE_NUMBER,
            desiredDateAndTime: dateFormat(now, DATETIME_FORMAT),
            timestamp: now.getTime()
        }
    });

    return parsed_url;
};

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
};

var sortRestaurantsByDistance = function(data) {
        return data.sort(
            function(objectA, objectB) {
                if (!objectA.distanceFromUserInMeters && objectB.distanceFromUserInMeters) return -1;
                if (objectA.distanceFromUserInMeters && !objectB.distanceFromUserInMeters) return 1;
                if (!objectA.distanceFromUserInMeters && !objectB.distanceFromUserInMeters) return 0;

                if (objectA.distanceFromUserInMeters > objectB.distanceFromUserInMeters)
                    return 1;
                if (objectB.distanceFromUserInMeters > objectA.distanceFromUserInMeters)
                    return -1;

                return 0;
            }
        );
};


var verifyMessage = function(req, formatters) {
    if (!req || !formatters || formatters.constructor != Array)
        return null;

    return formatters.find(function(formatter){
        return formatter.isValidMessage(req);
        });
};

var search = function(res, messageFormatter, restaurantName){
    if(restaurantName.length === 0){ // Behavior for empty command ('/10bis' with no content)
            var body = messageFormatter.getSuccessMessage(defaultResponse, "");
            res.send(body);
            return;
        }

        var parsed_url = generateSearchRequest(restaurantName);

        request(parsed_url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);

                var resBody = "";
                if (!data || !data.length || data.length < 1) {
                    resBody = messageFormatter.getErrorMessage(restaurantName);
                    res.send(resBody);
                    return;
                }

                resBody = messageFormatter.generateSearchResponse(filterByRestaurantName(sortRestaurantsByDistance(data)));
                res.send(resBody);
            } else {
                res.status(400);
                res.send('None shall pass');
            }
        });
};

var filterTotalOrders = function (restarant){
    // Filter all restaurants will positive pool value
    return restarant.PoolSumNumber > 0;
};

var getTotalOrders = function(res, messageFormatter){
         var parsed_url = generateGetTotalOrdersRequest();
         winston.debug('Total Orders Url: ' + parsed_url);

         request(parsed_url, function(error, response, body) {
             if (!error && response.statusCode == 200) {
                 var data = JSON.parse(body);

                 var resBody = "";
                 if (!data || !data.length || data.length < 1) {
                     resBody = messageFormatter.getErrorMessage();
                     res.send(resBody);
                     return;
                 }

                var restaurants = data.filter(filterTotalOrders);

                resBody = messageFormatter.generateTotalOrdersResponse(filterByRestaurantName(restaurants));
                res.send(resBody);
            } else {
                res.status(400);
                res.send('None shall pass');
            }
        });
};

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

        if (restaurantName.toLowerCase() == TOTAL_KEYWORD.toLowerCase())
            getTotalOrders(res, messageFormatter);
        else search(res, messageFormatter, restaurantName);
    }
};
