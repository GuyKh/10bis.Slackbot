import { Commons } from "./commons";

var slackMessage = require("./slackMessage.js");
var hipChatMessage = require("./hipChatMessage.js");
var url = require("url");
var request = require("request");
var moment = require("moment-timezone");
var winston = require("winston");
winston.level = process.env.LOG_LEVEL;


var defaultResponse = "Hi, I'm a 10bis bot, searching for restaurants\n" +
                        "To use me - enter /10bis Restaurant, e.g. '/10bis דיקסי'";

var TOTAL_KEYWORD = "total";
var DATE_FORMAT = "DD/MM/YYYY";
var TIME_FORMAT = "HH:mm:ss";
var TIMEZONE = "Asia/Jerusalem";


var getFormatedDateTime = function() {
    var date = moment.tz(TIMEZONE).format(DATE_FORMAT);
    var time = moment.tz(TIMEZONE).format(TIME_FORMAT);

    return date + "+" + time;
};

var generateSearchRequest = function(restaurantName: string) {

    var parsedUrl = url.format({
        pathname: "https://www.10bis.co.il/Restaurants/SearchRestaurants",
        query: {
            deliveryMethod: "Delivery",
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
            desiredDateAndTime: getFormatedDateTime(),
            timestamp: new Date().getTime()
        }
    });

    parsedUrl = parsedUrl.replace("%2B", "+");

    return parsedUrl;
};

var generateGetTotalOrdersRequest = function() {

    var parsedUrl = url.format({
        pathname: "https://www.10bis.co.il/Restaurants/SearchRestaurants",
        query: {
            deliveryMethod: "Delivery",
            ShowOnlyOpenForDelivery: false,
            id: process.env.USER_ID,
            pageNum: 0,
            pageSize: 50,
            OrderBy: "pool_sum",
            cuisineType: "",
            CityId: process.env.CITY_ID,
            StreetId: process.env.STREET_ID,
            FilterByKosher: false,
            FilterByBookmark: false,
            FilterByCoupon: false,
            searchPhrase: "",
            Latitude: process.env.LAT,
            Longitude: process.env.LONG,
            HouseNumber: process.env.HOUSE_NUMBER,
            desiredDateAndTime: getFormatedDateTime(),
            timestamp: new Date().getTime()
        }
    });


    parsedUrl = parsedUrl.replace("%2B", "+");

    return parsedUrl;
};

var filterByRestaurantName = function(restaurants :  Commons.Restaurant[]) {
    var flags = {};
    var filteredRestaurants = restaurants.filter(function(restarant : Commons.Restaurant) {
        if (flags[restarant.RestaurantName]) {
            return false;
        }
        flags[restarant.RestaurantName] = true;
        return true;
    });

    return filteredRestaurants;
};

var sortRestaurantsByDistance = function(restaurants :  Commons.Restaurant[]) {
        return restaurants.sort(
            function(objectA : Commons.Restaurant, objectB : Commons.Restaurant) {
                if (!objectA.distanceFromUserInMeters && objectB.distanceFromUserInMeters) { return -1; }
                if (objectA.distanceFromUserInMeters && !objectB.distanceFromUserInMeters) { return 1; }
                if (!objectA.distanceFromUserInMeters && !objectB.distanceFromUserInMeters) { return 0; }

                if (objectA.distanceFromUserInMeters > objectB.distanceFromUserInMeters) {
                    return 1;
                }
                if (objectB.distanceFromUserInMeters > objectA.distanceFromUserInMeters) {
                    return -1;
                }

                return 0;
            }
        );
};


var verifyMessage = function(req : Commons.Request, formatters : Commons.MessageFormatter[]) {
    if (!req || !formatters || formatters.constructor !== Array) {
        return null;
    }

    return formatters.find(function(formatter : Commons.MessageFormatter) {
        return formatter.isValidMessage(req);
        });
};

var search = function(res : Commons.Response, messageFormatter : Commons.MessageFormatter, restaurantName : string) {
    if (restaurantName.length === 0) { // Behavior for empty command ("/10bis" with no content)
            var body = messageFormatter.getSuccessMessage(defaultResponse, "");
            res.send(body);
            return;
        }

        var parsed_url = generateSearchRequest(restaurantName);

        request(parsed_url, function(error : Error, response : Commons.Response, body : string) {
            if (!error && response.statusCode === 200) {
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
                res.send("None shall pass");
            }
        });
};

var filterTotalOrders = function (restarant : Commons.Restaurant) {
    // Filter all restaurants will positive pool value
    return restarant.PoolSumNumber > 0;
};

var getTotalOrders = function(res : Commons.Response, messageFormatter : Commons.MessageFormatter) {
         var parsed_url = generateGetTotalOrdersRequest();
         winston.debug("Total Orders Url: " + parsed_url);

         request(parsed_url, function(error : Error, response : Commons.Response, body : string) {
             if (!error && response.statusCode === 200) {
                 var data = JSON.parse(body);

                 let resBody = "";
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
                res.send("None shall pass");
            }
        });
};

module.exports = {
    process: function(req: Commons.Request, res: Commons.Response) {
        var messageFormatter = verifyMessage(req, [hipChatMessage, slackMessage]);
        if (!messageFormatter) {
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

        if (restaurantName.toLowerCase() === TOTAL_KEYWORD.toLowerCase()) {
            getTotalOrders(res, messageFormatter);
        } else { search(res, messageFormatter, restaurantName); }
    }
};
