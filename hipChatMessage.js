// hipChatMessage.js

/*
HipChat Request:
{
    "event": "room_message",
    "item": {
        "message": {
            "date": "2015-01-20T22:45:06.662545+00:00",
            "from": {
                "id": 1661743,
                "mention_name": "Blinky",
                "name": "Blinky the Three Eyed Fish"
            },
            "id": "00a3eb7f-fac5-496a-8d64-a9050c712ca1",
            "mentions": [],
            "message": "/10bis דיקסי",
            "type": "message"
        },
        "room": {
            "id": 1147567,
            "name": "The Weather Channel"
        }
    },
    "webhook_id": 578829
}


HipChat Response:
{
    "color": "green",
    "message": "It's going to be sunny tomorrow! (yey)",
    "notify": false,
    "message_format": "text"
}
*/

var commandOperator = "/10bis";

module.exports = {
    getBadMessage: function(restaurantName) {
        var restaurantString = "";
        if (restaurantName)
            restaurantString = " for: " + restaurantName;

        var body = {
            color: "red",
            message: 'No Restaurants Found' + restaurantString,
            notify: false,
            message_format: "text"
        };

        return body;
    },

    getRestaurantName: function(req) {
        if (req.body.item && req.body.item.message && req.body.item.message.message) {
            var message = req.body.item.message.message;

            message = message.slice(commandOperator.length + 1); //get the value

            return message;
        }

        return null;
    },

    isValidMessage: function(req) {
        if (req.body.item && req.body.item.message && req.body.item.message.message) {
            return true;
        }

        return false;
    },

    getSuccessMessage: function(returnText, restaurantText) {
        var body = {
            color: "green",
            message: returnText + "\n" + restaurantText,
            notify: false,
            message_format: "text"
        }

        return body;
    }
};