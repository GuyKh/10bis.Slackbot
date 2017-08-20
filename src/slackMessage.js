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
                "fallback": "Required plain-text summary of the attachment.",
                "color": "#36a64f",
                "title": "גוטה בריא ומהיר",
                "title_link": "https://api.slack.com/",
                "text": "אוכל ביתי, בשרים, סלטים/סנדוויצ`ים",
                "fields": [
                    {
                        "title": "Priority",
                        "value": "High",
                        "short": false
                    },
                    {
                        "title": "Priority",
                        "value": "High",
                        "short": false
                    }
                ],
                "thumb_url": "https://d25t2285lxl5rf.cloudfront.net/images/shops/13048.gif",
                "ts": 123456789
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

    generateRestaurantCard: function(restaurant){
        var restaurantName = restaurant.RestaurantName;

        return {
                    fallback: "[1] " + restaurantName + " : https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=" + restaurant.RestaurantId,
                    title: restaurantName,
                    color: '#36a64f',
                    title_link: "https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=" + restaurant.RestaurantId,
                    text: restaurant.RestaurantCuisineList,
                    fields: [
                        {
                        "title": "מינימום הזמנה",
                        "value": restaurant.MinimumOrder,
                        "short": true
                        },
                        {
                        "title": "דמי משלוח",
                        "value": restaurant.DeliveryPrice,
                        "short": true
                        }
                    ],
                    thumb_url: restaurant.RestaurantLogoUrl,
                    ts: (Math.floor(Date.now() / 1000))
        };
    },

    generateResponse: function (restaurants) {
        var title = 'Found ' + restaurants.length + ' restaurants';

        var attachments = [];
        if (restaurants.length > 0) {

            if (restaurants.length == 1){
                // Create a special card
                attachments.push(this.generateRestaurantCard(restaurants[0]));
            } else {
                // Create a list
                restaurants.forEach(function (restaurant, index) {
                    var restaurantsString = '[' + (index + 1) + '] ' + restaurant.RestaurantName + " : https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=" + restaurant.RestaurantId;

                    attachments.push({
                        text: restaurantsString
                    });
                });
            }
        }

        var body = {
            response_type: "in_channel",
            text: title
        };

        if (attachments.length > 0) {
            body.attachments = attachments;
        }

        return body;
    }
};
