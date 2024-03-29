/* eslint-env node, mocha */
/* eslint no-unused-expressions:"off" */

import { deepCopy, restaurants, compareKeys } from "./testCommons.js";
import { HipChatModule } from "../src/hipChatModule.js";
import { HipChatMessageFormatter } from "../src/hipChatMessage.js";
import { Commons } from "../src/commons.js";
import "mocha";
import { Constants } from "../src/constants.js";
import { expect } from "chai";

const hipChatMessage = HipChatMessageFormatter.getInstance();

const message = new HipChatModule.HipChatReqBody(
  "room_message",
  new HipChatModule.HipChatReqItem(
    new HipChatModule.HipChatReqItemMessage(
      new Date("2015-01-20T22:45:06.66254500:00"),
      new HipChatModule.HipChatReqItemMessageFrom(
        1661743,
        "Blinky",
        "Blinky the Three Eyed Fish",
      ),
      "00a3eb7f-fac5-496a-8d64-a9050c712ca1",
      [],
      "/10bis אנסטסיה",
      "message",
    ),
    new HipChatModule.HipChatReqItemRoom(1147567, "The Weather Channel"),
  ),
  578829,
);

const badMessage = new HipChatModule.HipChatReqBody(
  "room_message",
  new HipChatModule.HipChatReqItem(
    new HipChatModule.HipChatReqItemMessage(
      new Date("2015-01-20T22:45:06.66254500:00"),
      new HipChatModule.HipChatReqItemMessageFrom(
        1661743,
        "Blinky",
        "Blinky the Three Eyed Fish",
      ),
      "00a3eb7f-fac5-496a-8d64-a9050c712ca1",
      [],
      null,
      "message",
    ),
    new HipChatModule.HipChatReqItemRoom(1147567, "The Weather Channel"),
  ),
  578829,
);

const goodResponse = new HipChatModule.HipChatResponse(
  "green",
  "Found 0 Restaurants",
  false,
  "text",
);

const errorResponse = new HipChatModule.HipChatResponse(
  "red",
  Constants.NO_RESTAURANTS_FOUND_STRING,
  false,
  "text",
);

const validCard = new HipChatModule.HipChatCard(
  "link",
  Constants.RESTAURANT_BASE_URL + 123,
  "ce399a28-a35a-4561-9262-ca28ccebbd6b",
  "אנסטסיה",
  "מסעדה אמריקאית\nמינימום הזמנה: 26 שח",
  new HipChatModule.UrlObject("http://image.jpg"),
  new Date().getTime(),
  new HipChatModule.UrlObject("http://image.jpg"),
);

const generateRestaurant = function (): Commons.Restaurant {
  return new Commons.RestaurantBuilder()
    .setRestaurantName("אנסטסיה")
    .setRestaurantId(123)
    .setMinimumOrder("26 שח")
    .setDeliveryPrice("10 שח")
    .setRestaurantCuisineList("מסעדה אמריקאית")
    .setRestaurantLogoUrl(validCard.thumbnail.url)
    .build();
};

describe("HipChatMessage", function () {
  describe("Basic methods and module", function () {
    it("should have a generateSearchResponse Method", function () {
      expect(typeof hipChatMessage).to.equal("object");
      expect(typeof hipChatMessage.generateSearchResponse).to.equal("function");
    });
    it("should have a generateTotalOrdersResponse Method", function () {
      expect(typeof hipChatMessage).to.equal("object");
      expect(typeof hipChatMessage.generateTotalOrdersResponse).to.equal(
        "function",
      );
    });
    it("should have a generateRestaurantCard Method", function () {
      expect(typeof hipChatMessage).to.equal("object");
      expect(typeof hipChatMessage.generateRestaurantCard).to.equal("function");
    });
    it("should have a getErrorMessage Method", function () {
      expect(typeof hipChatMessage).to.equal("object");
      expect(typeof hipChatMessage.getErrorMessage).to.equal("function");
    });
    it("should have a getRestaurantName Method", function () {
      expect(typeof hipChatMessage).to.equal("object");
      expect(typeof hipChatMessage.getRestaurantName).to.equal("function");
    });
    it("should have a isValidMessage Method", function () {
      expect(typeof hipChatMessage).to.equal("object");
      expect(typeof hipChatMessage.isValidMessage).to.equal("function");
    });
  });

  it("isValidMessage() should return true if default format message is sent", function () {
    const req = new HipChatModule.HipChatReq(deepCopy(message));
    expect(hipChatMessage.isValidMessage(req)).to.equal(true);
  });

  it("isValidMessage() should return false if message body is passing null", function () {
    expect(hipChatMessage.isValidMessage(null)).to.equal(false);
  });

  it("isValidMessage() should return false if message body is missing", function () {
    const req = new HipChatModule.HipChatReq(deepCopy(badMessage));
    expect(hipChatMessage.isValidMessage(req)).to.equal(false);
  });

  it("isValidMessage() should return false if request body is missing", function () {
    const req = null;
    expect(hipChatMessage.isValidMessage(req)).to.equal(false);
  });

  it("isValidMessage() should return true if message body is only the command", function () {
    const req = new HipChatModule.HipChatReq(deepCopy(message));
    req.body.item.message.message = "/10bis";
    expect(hipChatMessage.isValidMessage(req)).to.equal(true);
  });

  it("isValidMessage() should return false if message body doesn't start with the command", function () {
    const req = new HipChatModule.HipChatReq(deepCopy(message));
    req.body.item.message.message = "/test";
    expect(hipChatMessage.isValidMessage(req)).to.equal(false);
  });

  it("generateSearchResponse() should return a valid message without restaurant list", function () {
    const expectedResponse = deepCopy(goodResponse);
    const response = <HipChatModule.HipChatResponse>(
      hipChatMessage.generateSearchResponse([])
    );

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message).to.equal("Found 0 restaurants");
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

  it("generateSearchResponse() should return a valid message with restaurant list", function () {
    const expectedResponse = deepCopy(goodResponse);
    const response: HipChatModule.HipChatResponse = <
      HipChatModule.HipChatResponse
    >hipChatMessage.generateSearchResponse(restaurants);

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message.startsWith("Found 3 restaurants")).to.equal(true);
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

  it("generateSearchResponse() should return a valid message with restaurant list of 1 restaurant", function () {
    const expectedResponse = deepCopy(goodResponse);
    const response: HipChatModule.HipChatResponse = <
      HipChatModule.HipChatResponse
    >hipChatMessage.generateSearchResponse([restaurants[0]]);

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message.startsWith("Found 1 restaurants")).to.equal(true);
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

  it("getRestaurantName() should return right restaruant name from request", function () {
    const req = new HipChatModule.HipChatReq(deepCopy(message));
    const restaurantName: string = hipChatMessage.getRestaurantName(req);

    expect(restaurantName).to.equal("אנסטסיה");
  });

  it("getRestaurantName() should return an empty restaruant name from request with only command", function () {
    const req = new HipChatModule.HipChatReq(deepCopy(message));
    req.body.item.message.message = "/10bis";
    const restaurantName: string = hipChatMessage.getRestaurantName(req);

    expect(restaurantName).to.equal("");
  });

  it("getRestaurantName() should return null with bad field", function () {
    const req = new HipChatModule.HipChatReq(deepCopy(message));
    req.body.item.message.message = null;
    const restaurantName: string = hipChatMessage.getRestaurantName(req);

    expect(restaurantName).to.equal(null);
  });

  it("getErrorMessage() should return a valid error message without restaurants name", function () {
    const expectedResponse = deepCopy(errorResponse);
    const response: HipChatModule.HipChatResponse = <
      HipChatModule.HipChatResponse
    >hipChatMessage.getErrorMessage(null);

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message).to.equal(expectedResponse.message);
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

  it("getErrorMessage() should return a valid error message with passed restaurants name", function () {
    const expectedResponse = deepCopy(errorResponse);
    const response: HipChatModule.HipChatResponse = <
      HipChatModule.HipChatResponse
    >hipChatMessage.getErrorMessage("גוטה");

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message).to.equal(expectedResponse.message + " for: גוטה");
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

  it("generateRestaurantCard() should return a valid card", function () {
    const restaruant: Commons.Restaurant = generateRestaurant();

    const response: HipChatModule.HipChatCard =
      hipChatMessage.generateRestaurantCard(restaruant);

    // Can"t do the following due to on the spot generation of guid and time
    // expect(response).to.deep.equal(validCard);
    expect(compareKeys(response, validCard)).to.equal(true);

    expect(response.description).to.equal(validCard.description);
    expect(response.icon.url).to.equal(validCard.icon.url);
    expect(response.style).to.equal(validCard.style);
    expect(response.thumbnail.url).to.equal(validCard.thumbnail.url);
    expect(response.title).to.equal(validCard.title);
    expect(response.url).to.equal(validCard.url);
  });

  it("generateTotalOrdersResponse() should return a valid message without restaurant list", function () {
    const expectedResponse: HipChatModule.HipChatResponse =
      deepCopy(goodResponse);
    const response: HipChatModule.HipChatResponse =
      hipChatMessage.generateTotalOrdersResponse([]);

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message).to.equal("No pool order restaurants found");
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

  it("generateTotalOrdersResponse() should return a valid message with restaurant list", function () {
    const expectedResponse: HipChatModule.HipChatResponse =
      deepCopy(goodResponse);
    const response: HipChatModule.HipChatResponse =
      hipChatMessage.generateTotalOrdersResponse(restaurants);

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message.includes("[1]")).to.equal(true);
    expect(response.message.includes("[2]")).to.equal(true);
    expect(response.message.includes("[3]")).to.equal(true);
    expect(response.message.includes("[4]")).to.equal(false);
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

  it("constructor() should throw an exception if launched twice", function () {
    // Already ran constructor for HipChatMessageFormatter
    const hipChatMessageFormatter: Commons.MessageFormatter =
      HipChatMessageFormatter.getInstance();

    expect(hipChatMessageFormatter).not.to.equal(null);
    expect(HipChatMessageFormatter.getInstance()).not.to.equal(null);
    try {
      new HipChatMessageFormatter(); // eslint-disable-line no-new
    } catch (err) {
      expect(err.toString()).to.equal(
        "Error: " + HipChatMessageFormatter.INITIALIZATION_EXCEPTION_STRING,
      );
    }
  });
  it("getDefaultResponse() should return a default response", function () {
    const hipChatMessageFormatter: Commons.MessageFormatter =
      HipChatMessageFormatter.getInstance();

    const response: HipChatModule.HipChatResponse =
      hipChatMessageFormatter.getDefaultResponse() as HipChatModule.HipChatResponse;

    expect(response.color).to.equal("green");
    expect(response.card).to.be.undefined;
    expect(response.message).to.equal(Constants.DEFAULT_RESPONSE);
    expect(response.message_format).to.equal("text");
    expect(response.notify).to.equal(false);
  });
  it("getSucessMessage() should return a good response without a restaurant", function () {
    const hipChatMessageFormatter = HipChatMessageFormatter.getInstance();

    const responseText: string = "Found 1 restaurant";
    const response = hipChatMessageFormatter.getSuccessMessage(
      responseText,
      null,
    ) as HipChatModule.HipChatResponse;

    expect(response.color).to.equal("green");
    expect(response.card).to.be.undefined;
    expect(response.message).to.equal(responseText);
    expect(response.message_format).to.equal("text");
    expect(response.notify).to.equal(false);
  });
  it("getSucessMessage() should return a good response with a restaurant", function () {
    const hipChatMessageFormatter = HipChatMessageFormatter.getInstance();

    const responseText: string = "Found 1 restaurant";
    const restaruant = generateRestaurant();
    const response = hipChatMessageFormatter.getSuccessMessage(
      responseText,
      restaruant,
    ) as HipChatModule.HipChatResponse;

    expect(response.color).to.equal("green");
    expect(response.card).not.to.equal(null);
    expect(response.message).to.equal(responseText);
    expect(response.message_format).to.equal("text");
    expect(response.notify).to.equal(false);
  });
});
