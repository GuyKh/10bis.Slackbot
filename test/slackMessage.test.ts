/* eslint-env node, mocha */
/* eslint no-unused-expressions:"off" */

import { Constants } from "../src/constants";
import { SlackModule } from "../src/slackModule";
import { deepCopy, restaurants } from "./testCommons";
import { SlackMessageFormatter } from "../src/slackMessage";
import { Commons } from "../src/commons";
import { expect } from "chai";

const slackMessage = SlackMessageFormatter.getInstance();

const message = new SlackModule.SlackMessage(
  "ItoB7oEyZIbNmHPfxHQ2GrbC",
  "T0001",
  "example",
  "C2147483705",
  "test",
  "U2147483697",
  "Steve",
  "/10bis",
  "תאתא"
);

const goodResponse = new SlackModule.SlackResponse(
  "in_channel",
  "Found 0 restaurants",
  []
);
goodResponse.attachments.push(
  new SlackModule.SlackAttachment(null, null, null, null, "List", null, null)
);

const validCard = new SlackModule.SlackAttachment(
  "תאתא : https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=123",
  "תאתא",
  SlackMessageFormatter.GREEN_COLOR,
  "https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=123",
  "מסעדה אמריקאית",
  "http://image.jpg",
  Math.floor(Date.now() / 1000)
);
validCard.fields = [
  new SlackModule.SlackAttachmentField("מינימום הזמנה", "26 שח", true),
  new SlackModule.SlackAttachmentField("דמי משלוח", "10 שח", true),
];

const validTotalCard = new SlackModule.SlackAttachment(
  "תאתא : https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=123",
  "תאתא",
  SlackMessageFormatter.GREEN_COLOR,
  "https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=123",
  "מסעדה אמריקאית",
  "http://image.jpg",
  Math.floor(Date.now() / 1000)
);

validTotalCard.fields = [
  new SlackModule.SlackAttachmentField("הוזמן עד כה", "₪ 90.00", true),
  new SlackModule.SlackAttachmentField("מינימום הזמנה", "₪70.00", true),
];

const errorResponse = new SlackModule.SlackResponse(
  "ephemeral",
  Constants.NO_RESTAURANTS_FOUND_STRING,
  null
);

describe("SlackMessage", function () {
  describe("Basic methods and module", function () {
    it("should have a generateSearchResponse Method", function () {
      expect(typeof slackMessage).to.equal("object");
      expect(typeof slackMessage.generateSearchResponse).to.equal("function");
    });
    it("should have a generateTotalOrdersResponse Method", function () {
      expect(typeof slackMessage).to.equal("object");
      expect(typeof slackMessage.generateTotalOrdersResponse).to.equal(
        "function"
      );
    });
    it("should have a generateRestaurantCard Method", function () {
      expect(typeof slackMessage).to.equal("object");
      expect(typeof slackMessage.generateRestaurantCard).to.equal("function");
    });
    it("should have a generateRestaurantTotalCard Method", function () {
      expect(typeof slackMessage).to.equal("object");
      expect(typeof slackMessage.generateRestaurantTotalCard).to.equal(
        "function"
      );
    });
    it("should have a getErrorMessage Method", function () {
      expect(typeof slackMessage).to.equal("object");
      expect(typeof slackMessage.getErrorMessage).to.equal("function");
    });
    it("should have a getRestaurantName Method", function () {
      expect(typeof slackMessage).to.equal("object");
      expect(typeof slackMessage.getRestaurantName).to.equal("function");
    });
    it("should have a isValidMessage Method", function () {
      expect(typeof slackMessage).to.equal("object");
      expect(typeof slackMessage.isValidMessage).to.equal("function");
    });
  });
  it("isValidMessage() should return true if default format message is sent", function () {
    const req = new SlackModule.SlackRequest(deepCopy(message));
    expect(slackMessage.isValidMessage(req)).to.equal(true);
  });

  it("isValidMessage() should return false if message body is passing null", function () {
    expect(slackMessage.isValidMessage(null)).to.equal(false);
  });

  it("isValidMessage() should return false if message body is missing", function () {
    const req = new SlackModule.SlackRequest(null);
    expect(slackMessage.isValidMessage(req)).to.equal(false);
  });

  it("isValidMessage() should return false if request body is missing", function () {
    const req: SlackModule.SlackRequest = null;
    expect(slackMessage.isValidMessage(req)).to.equal(false);
  });

  it("isValidMessage() should return true if message body is only the command", function () {
    const req: SlackModule.SlackRequest = new SlackModule.SlackRequest(null);
    req.body = deepCopy(message);
    req.body.command = "/10bis";
    req.body.text = "";
    expect(slackMessage.isValidMessage(req)).to.equal(true);
  });

  it("isValidMessage() should return true if message body doesn't start with the command", function () {
    const req: SlackModule.SlackRequest = new SlackModule.SlackRequest(null);
    req.body = deepCopy(message);
    req.body.command = "/test";
    expect(slackMessage.isValidMessage(req)).to.equal(false);
  });

  it("generateSearchResponse() should return a valid message without restaurant list", function () {
    const expectedResponse: SlackModule.SlackResponse = deepCopy(goodResponse);
    const response: SlackModule.SlackResponse = slackMessage.generateSearchResponse(
      []
    );

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal(expectedResponse.text);
    expect(response.attachments).to.equal(null);
  });

  it("generateSearchResponse() should return a valid message with restaurant list", function () {
    const expectedResponse: SlackModule.SlackResponse = deepCopy(goodResponse);
    const response: SlackModule.SlackResponse = slackMessage.generateSearchResponse(
      restaurants
    );

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal("Found 3 restaurants");
    expect(response.attachments).not.equal(null);
    expect(response.attachments.length).to.equal(3);

    let i: number = 0;
    response.attachments.forEach((attachment) => {
      expect(attachment.fields).not.equal(null);
      expect(attachment.fields.length).to.equal(2);
      expect(attachment.fields[0].title).to.equal("מינימום הזמנה");
      expect(attachment.fields[0].value).to.equal(restaurants[i].MinimumOrder);
      expect(attachment.fields[1].title).to.equal("דמי משלוח");
      expect(attachment.fields[1].value).to.equal(restaurants[i].DeliveryPrice);
      i++;
    });
  });

  it("generateSearchResponse() should return a valid message with restaurant list > Maximum Size", function () {
    let bigAmountOfRestaurants = [];
    bigAmountOfRestaurants = bigAmountOfRestaurants.concat(restaurants);
    bigAmountOfRestaurants = bigAmountOfRestaurants.concat(restaurants);
    bigAmountOfRestaurants = bigAmountOfRestaurants.concat(restaurants);

    const response: SlackModule.SlackResponse = slackMessage.generateSearchResponse(
      bigAmountOfRestaurants
    );

    expect(response.response_type).to.equal(goodResponse.response_type);
    expect(response.text).to.equal(
      "Found " + bigAmountOfRestaurants.length + " restaurants"
    );
    expect(response.attachments).not.equal(null);
    expect(response.attachments.length).to.equal(1);
  });

  it("getRestaurantName() should return right restaruant name from request", function () {
    const req: SlackModule.SlackRequest = new SlackModule.SlackRequest(
      deepCopy(message)
    );
    const restaurantName: string = slackMessage.getRestaurantName(req);

    expect(restaurantName).to.equal("תאתא");
  });
  it("getRestaurantName() should return null if no body exists", function () {
    const req: SlackModule.SlackRequest = new SlackModule.SlackRequest(
      deepCopy(message)
    );
    req.body = null;
    const restaurantName: string = slackMessage.getRestaurantName(req);

    expect(restaurantName).to.equal(null);
  });
  it("getRestaurantName() should return an empty restaruant name from request with only command", function () {
    const req: SlackModule.SlackRequest = new SlackModule.SlackRequest(null);
    req.body = deepCopy(message);
    req.body.text = "";
    const restaurantName: string = slackMessage.getRestaurantName(req);

    expect(restaurantName).to.equal("");
  });

  it("getRestaurantName() should return null with bad field", function () {
    const req: SlackModule.SlackRequest = new SlackModule.SlackRequest(null);
    req.body = deepCopy(message);
    req.body.text = null;
    const restaurantName: string = slackMessage.getRestaurantName(req);

    expect(restaurantName).to.equal(null);
  });

  it("getErrorMessage() should return a valid error message without restaurants name", function () {
    const expectedResponse: SlackModule.SlackResponse = deepCopy(errorResponse);
    const response: SlackModule.SlackResponse = <SlackModule.SlackResponse>(
      slackMessage.getErrorMessage(null)
    );

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal(expectedResponse.text);
  });

  it("getErrorMessage() should return a valid error message with passed restaurants name", function () {
    const expectedResponse: SlackModule.SlackResponse = deepCopy(errorResponse);
    const response: SlackModule.SlackResponse = <SlackModule.SlackResponse>(
      slackMessage.getErrorMessage("גוטה")
    );

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal(expectedResponse.text + " for: גוטה");
  });

  it("generateRestaurantCard() should return a valid card", function () {
    const restaruant = new Commons.RestaurantBuilder()
      .setRestaurantName("תאתא")
      .setRestaurantId(123)
      .setMinimumOrder("26 שח")
      .setDeliveryPrice("10 שח")
      .setRestaurantCuisineList("מסעדה אמריקאית")
      .setRestaurantLogoUrl("http://image.jpg")
      .build();

    const attachment: SlackModule.SlackAttachment = slackMessage.generateRestaurantCard(
      restaruant
    );

    // Can"t do the following due to on the spot generation of guid and time
    // expect(response).to.deep.equal(validCard);

    expect(attachment.color).to.equal(validCard.color);
    expect(attachment.fallback).to.equal(validCard.fallback);
    expect(attachment.fields).to.deep.equal(validCard.fields);
    expect(attachment.text).to.equal(validCard.text);
    expect(attachment.title).to.equal(validCard.title);
    expect(attachment.title_link).to.equal(validCard.title_link);
  });

  it("generateTotalOrdersResponse() should return a valid message without restaurant list", function () {
    const expectedResponse: SlackModule.SlackResponse = deepCopy(goodResponse);
    const response: SlackModule.SlackResponse = slackMessage.generateTotalOrdersResponse(
      []
    );

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal("No pool order restaurants found");
    expect(response.attachments).to.equal(null);
  });

  it("generateTotalOrdersResponse() should return a valid message with restaurant list", function () {
    const expectedResponse: SlackModule.SlackResponse = deepCopy(goodResponse);
    const response: SlackModule.SlackResponse = slackMessage.generateTotalOrdersResponse(
      [restaurants[0]]
    );

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal("Found 1 restaurants");
    expect(response.attachments).not.equal(null);
    expect(response.attachments.length).to.equal(1);
    expect(response.attachments[0].fields).not.equal(null);
    expect(response.attachments[0].fields.length).to.equal(2);
    expect(response.attachments[0].fields[0].title).to.equal("הוזמן עד כה");
    expect(response.attachments[0].fields[0].value).to.equal(
      restaurants[0].PoolSum
    );
    expect(response.attachments[0].fields[1].title).to.equal("מינימום הזמנה");
    expect(response.attachments[0].fields[1].value).to.equal(
      restaurants[0].MinimumOrder
    );
  });

  it("generateTotalOrdersResponse() should return a valid message with restaurant list", function () {
    const expectedResponse: SlackModule.SlackResponse = deepCopy(goodResponse);
    const response: SlackModule.SlackResponse = slackMessage.generateTotalOrdersResponse(
      restaurants
    );

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal("Found 3 restaurants");
    expect(response.attachments).not.equal(null);
    expect(response.attachments.length).to.equal(3);

    let i: number = 0;
    response.attachments.forEach((attachment) => {
      expect(attachment.fields).not.equal(null);
      expect(attachment.fields.length).to.equal(2);
      expect(attachment.fields[0].title).to.equal("הוזמן עד כה");
      expect(attachment.fields[0].value).to.equal(restaurants[i].PoolSum);
      expect(attachment.fields[1].title).to.equal("מינימום הזמנה");
      expect(attachment.fields[1].value).to.equal(restaurants[i].MinimumOrder);
      i++;
    });
  });

  it("generateTotalOrdersResponse() should paint the cards in Red and Green according to wether the minimum order sum is fulfilled", function () {
    const response: SlackModule.SlackResponse = slackMessage.generateTotalOrdersResponse(
      restaurants
    );

    expect(response.text).to.equal("Found 3 restaurants");
    expect(response.attachments).not.equal(null);
    expect(response.attachments.length).to.equal(3);

    let i: number = 0;
    response.attachments.forEach((attachment) => {
      if (restaurants[i].IsOverPoolMin) {
        expect(attachment.color).to.equal(SlackMessageFormatter.GREEN_COLOR);
      } else {
        expect(attachment.color).to.equal(SlackMessageFormatter.RED_COLOR);
      }

      if (restaurants[i].MinimumPriceForOrder <= restaurants[i].PoolSumNumber) {
        expect(attachment.color).to.equal(SlackMessageFormatter.GREEN_COLOR);
      } else {
        expect(attachment.color).to.equal(SlackMessageFormatter.RED_COLOR);
      }
      i++;
    });
  });

  it("generateTotalOrdersResponse() should return a valid message with restaurant list > Maximum", function () {
    let bigAmountOfRestaurants = [];
    bigAmountOfRestaurants = bigAmountOfRestaurants.concat(restaurants);
    bigAmountOfRestaurants = bigAmountOfRestaurants.concat(restaurants);
    bigAmountOfRestaurants = bigAmountOfRestaurants.concat(restaurants);
    const response: SlackModule.SlackResponse = slackMessage.generateTotalOrdersResponse(
      bigAmountOfRestaurants
    );

    expect(response.response_type).to.equal(goodResponse.response_type);
    expect(response.text).to.equal(
      "Found " + bigAmountOfRestaurants.length + " restaurants"
    );
    expect(response.attachments).not.equal(null);
    expect(response.attachments.length).to.equal(1);
  });

  it("generateRestaurantTotalCard() should return a valid card", function () {
    const restaruant = new Commons.RestaurantBuilder()
      .setRestaurantName("תאתא")
      .setRestaurantId(123)
      .setMinimumOrder("₪70.00")
      .setPoolSum("₪ 90.00")
      .setIsOverPoolMin(true)
      .setRestaurantCuisineList("מסעדה אמריקאית")
      .setRestaurantLogoUrl("http://image.jpg")
      .build();

    const attachment: SlackModule.SlackAttachment = slackMessage.generateRestaurantTotalCard(
      restaruant
    );

    // Can"t do the following due to on the spot generation of guid and time
    // expect(response).to.deep.equal(validCard);

    expect(attachment.color).to.equal(validTotalCard.color);
    expect(attachment.fallback).to.equal(validTotalCard.fallback);
    expect(attachment.fields).to.deep.equal(validTotalCard.fields);
    expect(attachment.text).to.equal(validTotalCard.text);
    expect(attachment.title).to.equal(validTotalCard.title);
    expect(attachment.title_link).to.equal(validTotalCard.title_link);
  });
  it("constructor() should throw an exception if launched twice", function () {
    // Already ran constructor for SlackMessageFormatter
    const slackMessageFormatter = SlackMessageFormatter.getInstance();

    expect(slackMessageFormatter).not.to.equal(null);
    expect(SlackMessageFormatter.getInstance()).not.to.equal(null);
    try {
      new SlackMessageFormatter(); // eslint-disable-line no-new
    } catch (err) {
      expect(err.toString()).to.equal(
        "Error: " + SlackMessageFormatter.INSTANTIATION_ERROR
      );
    }
  });
  it("getDefaultResponse() should return a default response", function () {
    const slackMessageFormatter = SlackMessageFormatter.getInstance();

    const response = slackMessageFormatter.getDefaultResponse() as SlackModule.SlackResponse;

    expect(response.response_type).to.equal("ephemeral");
    expect(response.attachments).to.be.null;
    expect(response.text).to.equal(Constants.DEFAULT_RESPONSE);
  });
});
