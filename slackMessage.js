/*
{
    token=ItoB7oEyZIbNmHPfxHQ2GrbC,
    team_id=T0001,
    team_domain=example,
    channel_id=C2147483705,
    channel_name=test,
user_id=U2147483697
user_name=Steve
command=/weather
text=94070
}
*/

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
    isValidMessage: function(req) {
        if (req.body.text) {
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