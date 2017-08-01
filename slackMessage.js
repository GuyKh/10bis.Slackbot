module.exports = {
    getBadMessage: function(restaurantName) {
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
        if (req.body.text)
            return req.body.text;

        return null;
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