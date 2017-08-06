/*
Request:
{
    "token"="ItoB7oEyZIbNmHPfxHQ2GrbC"",
    "team_id"="T0001",
    "team_domain"="example",
    "channel_id"="C2147483705",
    "channel_name"="test",
    "user_id"="U2147483697",
    "user_name"="Steve",
    "command"="/weather",
    "text"="94070
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
    getErrorMessage: function(restaurantName) {
        var restaurantString = "";
        if (restaurantName)
            restaurantString = " for: " + restaurantName;

        var body = {
            response_type: "ephemeral",
            text: 'No Restaurants Found' + restaurantString
        };

        return body;
    },

    getRestaurantName: function(req) {
        if (req && req.body)
            return req.body.text;

        return null;
    },
    isValidMessage: function(req) {
        if (req && req.body && req.body.command && req.body.command === commandOperator) {
            return true;
        }

        return false;
    },
    getSuccessMessage: function(returnText, restaurantText) {
        var body = {
            response_type: "in_channel",
            text: returnText,
            attachments: [{
                "text": restaurantText
            }]
        }

        return body;
    }
};