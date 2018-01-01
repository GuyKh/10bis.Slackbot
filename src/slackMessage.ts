import {SlackModule} from "../src/slackModule";
import { Commons } from "./commons";


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
var MAX_RESTAURANT_CARDS = 5;

export class SlackMessageFormatter implements Commons.MessageFormatter {

    private static _instance: SlackMessageFormatter = new SlackMessageFormatter();

    constructor() {
        if (SlackMessageFormatter._instance) {
            throw new Error("Error: Instantiation failed: Use HipChatMessageFormatter.getInstance() instead of new.");
        }
        SlackMessageFormatter._instance = this;
    }

    public static getInstance(): SlackMessageFormatter {
        return SlackMessageFormatter._instance;
    }

    getDefaultResponse(): Commons.TenBisResponse {
        return new SlackModule.SlackResponse("ephemeral", Commons.DefaultResponseString, null);
    }
    getErrorMessage(restaurantName: string): Commons.TenBisResponse {
        var restaurantString = "";
        if (restaurantName) {
            restaurantString = " for: " + restaurantName;
        }

        var response = new SlackModule.SlackResponse("ephemeral", "No Restaurants Found" + restaurantString, null);

        return response;
    }

    getRestaurantName(req: Commons.Request): string {
        if (req && req.body) {
            return req.body.text;
        }

        return null;
    }
    generateSearchResponse(restaurants: Commons.Restaurant[]): SlackModule.SlackResponse {
        var title = "Found " + restaurants.length + " restaurants";

        var attachments = [];
        if (restaurants.length > 0) {

            if (restaurants.length < MAX_RESTAURANT_CARDS) {
                var generateRestaurantCard = this.generateRestaurantCard;

                // For up to 5 restaurants, create a card
                restaurants.forEach(function (restaurant : Commons.Restaurant, index : number) {
                    attachments.push(generateRestaurantCard(restaurant));
                });
            } else {
                // Create a list
                restaurants.forEach(function (restaurant : Commons.Restaurant, index : number) {
                    var restaurantsString = "[" + (index + 1) + "] " + restaurant.RestaurantName +
                     " : https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=" + restaurant.RestaurantId;

                    attachments.push({
                        text: restaurantsString
                    });
                });
            }
        }

        let response = new SlackModule.SlackResponse(
            "in_channel",
            title,
            null
        );

        if (attachments.length > 0) {
            response.attachments = attachments;
        }

        return response;
    }
    generateTotalOrdersResponse(restaurants: Commons.Restaurant[]): SlackModule.SlackResponse {
        var title = "Found " + restaurants.length + " restaurants";

        var attachments = [];
        if (restaurants.length > 0) {

            if (restaurants.length < MAX_RESTAURANT_CARDS) {
                var generateRestaurantTotalCard = this.generateRestaurantTotalCard;

                // For up to 5 restaurants, create a card
                restaurants.forEach(function (restaurant : Commons.Restaurant, index : number) {
                    attachments.push(generateRestaurantTotalCard(restaurant));
                });
            } else {
                // Create a list
                restaurants.forEach(function (restaurant : Commons.Restaurant, index : number) {
                    var restaurantsString = "[" + (index + 1) + "] " + restaurant.RestaurantName +
                    " : https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=" + restaurant.RestaurantId;

                    attachments.push(
                        new SlackModule.SlackAttachment(null, null, null, null, restaurantsString, null, null)
                     );
                });
            }
        } else {
            title = "No pool order restaurants found";
        }

        let slackResponse = new SlackModule.SlackResponse("in_channel", title, null);

        if (attachments.length > 0) {
            slackResponse.attachments = attachments;
        }

        return slackResponse;
    }

    isValidMessage(req: SlackModule.SlackRequest): boolean {
        if (req && req.body && req.body.command && req.body.command === commandOperator) {
            return true;
        }

        return false;
    }

    generateRestaurantCard (restaurant : Commons.Restaurant) {
        var restaurantName = restaurant.RestaurantName;

        let slackAttachment = new SlackModule.SlackAttachment(
            restaurantName + " : https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=" + restaurant.RestaurantId,
            restaurantName,
            "#36a64f",
            "https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=" + restaurant.RestaurantId,
            restaurant.RestaurantCuisineList,
            restaurant.RestaurantLogoUrl,
            (Math.floor(Date.now() / 1000)));

        slackAttachment.fields = [];
        slackAttachment.fields.push(new SlackModule.SlackAttachmentField(
            "מינימום הזמנה",
            restaurant.MinimumOrder,
            true
        ));

        slackAttachment.fields.push(new SlackModule.SlackAttachmentField(
            "דמי משלוח",
            restaurant.DeliveryPrice,
            true
        ));

        return slackAttachment;
    }

    generateRestaurantTotalCard (restaurant : Commons.Restaurant) {
        var restaurantName = restaurant.RestaurantName;

        let slackAttachment = new SlackModule.SlackAttachment(
            restaurantName + " : https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=" + restaurant.RestaurantId,
            restaurantName,
            "#36a64f",
            "https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=" + restaurant.RestaurantId,
            restaurant.RestaurantCuisineList,
            restaurant.RestaurantLogoUrl,
            (Math.floor(Date.now() / 1000))
        );

        slackAttachment.fields = [];
        slackAttachment.fields.push(new SlackModule.SlackAttachmentField(
            "הוזמן עד כה",
            restaurant.PoolSum,
            true
        ));

        slackAttachment.fields.push(new SlackModule.SlackAttachmentField(
            "מינימום הזמנה",
            restaurant.MinimumOrder,
            true
        ));

        return slackAttachment;
    }
}