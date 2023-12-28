import { SlackModule } from "../src/slackModule";
import { Commons } from "./commons";
import { Constants } from "./constants";

/*
Request:
{
    "token"="...",
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
const commandOperator: string = "/10bis";
const MAX_RESTAURANT_CARDS: number = 5;

export class SlackMessageFormatter implements Commons.MessageFormatter {
  public static GREEN_COLOR: string = "#36a64f";

  public static RED_COLOR: string = "#a53c2e";

  private static _instance: SlackMessageFormatter = new SlackMessageFormatter();

  public static INSTANTIATION_ERROR: string =
    "Instantiation failed: Use HipChatMessageFormatter.getInstance() instead of new.";

  constructor() {
    if (SlackMessageFormatter._instance) {
      throw new Error(SlackMessageFormatter.INSTANTIATION_ERROR);
    }
    SlackMessageFormatter._instance = this;
  }

  public static getInstance(): SlackMessageFormatter {
    return SlackMessageFormatter._instance;
  }

  getDefaultResponse(): Commons.TenBisResponse {
    return new SlackModule.SlackResponse(
      "ephemeral",
      Constants.DEFAULT_RESPONSE,
      null,
    );
  }

  getErrorMessage(restaurantName: string): Commons.TenBisResponse {
    let restaurantString: string = "";
    if (restaurantName) {
      restaurantString = " for: " + restaurantName;
    }

    const response: Commons.TenBisResponse = new SlackModule.SlackResponse(
      "ephemeral",
      Constants.NO_RESTAURANTS_FOUND_STRING + restaurantString,
      null,
    );

    return response;
  }

  getRestaurantName(req: Commons.Request): string {
    if (req && req.body) {
      return req.body.text;
    }

    return null;
  }

  generateSearchResponse(
    restaurants: Commons.Restaurant[],
  ): SlackModule.SlackResponse {
    const title: string = "Found " + restaurants.length + " restaurants";

    const attachments: SlackModule.SlackAttachment[] = [];
    if (restaurants.length > 0) {
      if (restaurants.length < MAX_RESTAURANT_CARDS) {
        const generateRestaurantCard: Function = this.generateRestaurantCard;
        // For up to 5 restaurants, create a card
        restaurants.forEach(function (restaurant: Commons.Restaurant) {
          attachments.push(generateRestaurantCard(restaurant));
        });
      } else {
        let restaurantsString: string = "";
        // Create a list
        restaurants.forEach(function (
          restaurant: Commons.Restaurant,
          index: number,
        ) {
          restaurantsString +=
            "[" +
            (index + 1) +
            "] " +
            restaurant.RestaurantName +
            " : " +
            Constants.RESTAURANT_BASE_URL +
            restaurant.RestaurantId +
            (index < restaurants.length - 1 ? "\n" : "");
        });

        attachments.push(
          new SlackModule.SlackAttachment(
            null,
            null,
            null,
            null,
            restaurantsString,
            null,
            null,
          ),
        );
      }
    }

    const response = new SlackModule.SlackResponse("in_channel", title, null);

    if (attachments.length > 0) {
      response.attachments = attachments;
    }

    return response;
  }

  generateTotalOrdersResponse(
    restaurants: Commons.Restaurant[],
  ): SlackModule.SlackResponse {
    let title: string = "Found " + restaurants.length + " restaurants";

    const attachments: SlackModule.SlackAttachment[] = [];
    if (restaurants.length > 0) {
      if (restaurants.length < MAX_RESTAURANT_CARDS) {
        const generateRestaurantTotalCard: Function =
          this.generateRestaurantTotalCard;

        // For up to 5 restaurants, create a card
        restaurants.forEach(function (restaurant: Commons.Restaurant) {
          attachments.push(generateRestaurantTotalCard(restaurant));
        });
      } else {
        let restaurantsString: string = "";
        let wasFirstUnderLimitRestaurantDone: boolean = false;

        // Create a list
        restaurants.forEach(function (
          restaurant: Commons.Restaurant,
          index: number,
        ) {
          if (
            (!restaurant.IsOverPoolMin ||
              restaurant.PoolSumNumber < restaurant.MinimumPriceForOrder) &&
            !wasFirstUnderLimitRestaurantDone
          ) {
            wasFirstUnderLimitRestaurantDone = true;
            restaurantsString +=
              "-------------------------- UNDER THE MINIMUM SUM --------------------------\n";
          }

          restaurantsString +=
            "[" +
            (index + 1) +
            "] " +
            restaurant.RestaurantName +
            " : " +
            Constants.RESTAURANT_BASE_URL +
            restaurant.RestaurantId +
            "\nTotal Sum Ordered: " +
            restaurant.PoolSum +
            "\tMinimum Order Sum: " +
            restaurant.MinimumOrder +
            (index < restaurants.length - 1 ? "\n" : "");
        });

        attachments.push(
          new SlackModule.SlackAttachment(
            null,
            null,
            null,
            null,
            restaurantsString,
            null,
            null,
          ),
        );
      }
    } else {
      title = "No pool order restaurants found";
    }

    const slackResponse = new SlackModule.SlackResponse(
      "in_channel",
      title,
      null,
    );

    if (attachments.length > 0) {
      slackResponse.attachments = attachments;
    }

    return slackResponse;
  }

  isValidMessage(req: SlackModule.SlackRequest): boolean {
    if (
      req &&
      req.body &&
      req.body.command &&
      req.body.command === commandOperator
    ) {
      return true;
    }

    return false;
  }

  generateRestaurantCard(
    restaurant: Commons.Restaurant,
  ): SlackModule.SlackAttachment {
    const slackAttachment = SlackModule.SlackAttachment.fromRestaurant(
      restaurant,
      "#36a64f",
    );

    slackAttachment.fields = [];
    slackAttachment.fields.push(
      new SlackModule.SlackAttachmentField(
        "מינימום הזמנה",
        restaurant.MinimumOrder,
        true,
      ),
    );

    slackAttachment.fields.push(
      new SlackModule.SlackAttachmentField(
        "דמי משלוח",
        restaurant.DeliveryPrice,
        true,
      ),
    );

    return slackAttachment;
  }

  generateRestaurantTotalCard(
    restaurant: Commons.Restaurant,
  ): SlackModule.SlackAttachment {
    const slackAttachment =
      SlackModule.SlackAttachment.fromRestaurant(restaurant);

    slackAttachment.fields = [];
    slackAttachment.fields.push(
      new SlackModule.SlackAttachmentField(
        "הוזמן עד כה",
        restaurant.PoolSum,
        true,
      ),
    );

    slackAttachment.fields.push(
      new SlackModule.SlackAttachmentField(
        "מינימום הזמנה",
        restaurant.MinimumOrder,
        true,
      ),
    );

    return slackAttachment;
  }
}
