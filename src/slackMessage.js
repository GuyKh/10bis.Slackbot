/*
Request:
{
    "token"="ItoB7oEyZIbNmHPfxHQ2GrbC",
    "team_id"="T0001",
    "team_domain"="example",
    "channel_id"="C2147483705",
    "channel_name"="test",
    "user_id"="U2147483697",
    "user_name"="Steve",
    "command"="/10bis",
    "text"="בראסרי"
}

Response:
{
    "response_type": "in_channel",
    "text": "It's 80 degrees right now.",
    "attachments": [
        {
            "text":"Partly cloudy today and tomorrow"
        }
    ]
}
*/
var commandOperator = "/10bis";

module.exports = {
    getErrorMessage: function (restaurantName) {
        var restaurantString = "";
        if (restaurantName)
            restaurantString = " for: " + restaurantName;

        var body = {
            response_type: "ephemeral",
            text: 'No Restaurants Found' + restaurantString
        };

        return body;
    },

    getRestaurantName: function (req) {
        if (req && req.body)
            return req.body.text;

        return null;
    },

    isValidMessage: function (req) {
        if (req && req.body && req.body.command && req.body.command === commandOperator) {
            return true;
        }

        return false;
    },

    generateResponse: function (restaurants) {
        var title = 'Found ' + restaurants.length + ' restaurants';

        var attachments = [];
        if (restaurants.length > 0) {

            restaurants.forEach(function (restaurant, index) {
                var restaurantsString = '[' + (index + 1) + '] ' + restaurant.RestaurantName + " : https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=" + restaurant.RestaurantId;

                attachments.push({
                    text: restaurantsString
                });
            });
        }

        var body = {
            response_type: "in_channel",
            text: title
        }

        if (attachments.length > 0) {
            body.attachments = attachments;
        }

        return body;
    }
};