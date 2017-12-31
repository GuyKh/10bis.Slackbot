import { Req } from "./app.test";
import { deepCopy } from "./commons";
import { HipChatModule } from "../src/hipChatModule";

// tests/hipChatMessage.test.js
var chai = require("chai");
var expect = chai.expect; // we are using the "expect" style of Chai
var hipChatMessage = require("./../src/hipChatMessage.js");
var helper = require("./helper.js");

let message = new HipChatModule.HipChatReqBody("room_message",
                  new HipChatModule.HipChatReqItem(
                      new HipChatModule.HipChatReqItemMessage(
                        new Date("2015-01-20T22:45:06.66254500:00"),
                        new HipChatModule.HipChatReqItemMessageFrom(1661743, "Blinky", "Blinky the Three Eyed Fish"),
                        "00a3eb7f-fac5-496a-8d64-a9050c712ca1",
                         [],
                         "/10bis דיקסי",
                         "message"),
                      new HipChatModule.HipChatReqItemRoom(1147567, "The Weather Channel")),
                  578829);

let badMessage = new HipChatModule.HipChatReqBody("room_message",
      new HipChatModule.HipChatReqItem(
          new HipChatModule.HipChatReqItemMessage(
            new Date("2015-01-20T22:45:06.66254500:00"),
            new HipChatModule.HipChatReqItemMessageFrom(1661743, "Blinky", "Blinky the Three Eyed Fish"),
            "00a3eb7f-fac5-496a-8d64-a9050c712ca1",
              [],
              null,
              "message"),
          new HipChatModule.HipChatReqItemRoom(1147567, "The Weather Channel")),
      578829);

let goodResponse = new HipChatModule.HipChatResponse("green", "Found 0 Restaurants", false, "text");

let errorResponse = new HipChatModule.HipChatResponse("red", "No Restaurants Found", false, "text");

var validCard = {
  style: "link",
  url: "https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=" + 123,
  id: "ce399a28-a35a-4561-9262-ca28ccebbd6b",
  title: "דיקסי",
  description: "מסעדה אמריקאית\nמינימום הזמנה: 26 שח",
  icon: {
      "url": "http://image.jpg"
  },
  date: (new Date()).getTime(),
  thumbnail: {
      url: "http://image.jpg"
  }
};

describe("HipChatMessage", function() {
  describe("Basic methods and module", function() {
    it("should have a generateSearchResponse Method", function() {
      expect(typeof hipChatMessage).to.equal("object");
      expect(typeof hipChatMessage.generateSearchResponse).to.equal("function");
    });
    it("should have a generateTotalOrdersResponse Method", function() {
      expect(typeof hipChatMessage).to.equal("object");
      expect(typeof hipChatMessage.generateTotalOrdersResponse).to.equal("function");
    });
    it("should have a generateRestaurantCard Method", function() {
      expect(typeof hipChatMessage).to.equal("object");
      expect(typeof hipChatMessage.generateRestaurantCard).to.equal("function");
    });
    it("should have a getErrorMessage Method", function() {
      expect(typeof hipChatMessage).to.equal("object");
      expect(typeof hipChatMessage.getErrorMessage).to.equal("function");
    });
    it("should have a getRestaurantName Method", function() {
      expect(typeof hipChatMessage).to.equal("object");
      expect(typeof hipChatMessage.getRestaurantName).to.equal("function");
    });
    it("should have a isValidMessage Method", function() {
      expect(typeof hipChatMessage).to.equal("object");
      expect(typeof hipChatMessage.isValidMessage).to.equal("function");
    });
  });

  it("isValidMessage() should return true if default format message is sent", function() {
    let req = new Req(deepCopy(message));
    expect(hipChatMessage.isValidMessage(req)).to.equal(true);
  });

  it("isValidMessage() should return false if message body is passing null", function() {
    expect(hipChatMessage.isValidMessage(null)).to.equal(false);
  });

  it("isValidMessage() should return false if message body is missing", function() {
    let req = new Req(deepCopy(badMessage));
    expect(hipChatMessage.isValidMessage(req)).to.equal(false);
  });

  it("isValidMessage() should return false if request body is missing", function() {
    var req = {};
    expect(hipChatMessage.isValidMessage(req)).to.equal(false);
  });

  it("isValidMessage() should return true if message body is only the command", function() {
    let req = new HipChatModule.HipChatReq(deepCopy(message));
    req.body.item.message.message = "/10bis";
    expect(hipChatMessage.isValidMessage(req)).to.equal(true);
  });

  it("isValidMessage() should return false if message body doesn't start with the command", function() {
    let req = new HipChatModule.HipChatReq(deepCopy(message));
    req.body.item.message.message = "/test";
    expect(hipChatMessage.isValidMessage(req)).to.equal(false);
  });

  it("generateSearchResponse() should return a valid message without restaurant list", function() {
    let expectedResponse = deepCopy(goodResponse);
    var response = hipChatMessage.generateSearchResponse([]);

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message).to.equal("Found 0 restaurants");
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

  it("generateSearchResponse() should return a valid message with restaurant list", function() {
    let expectedResponse = deepCopy(goodResponse);
    var response = hipChatMessage.generateSearchResponse(helper.restaurants);

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message.startsWith("Found 2 restaurants")).to.equal(true);
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

  it("getRestaurantName() should return right restaruant name from request", function() {
    let req = new HipChatModule.HipChatReq(deepCopy(message));
    var restaurantName = hipChatMessage.getRestaurantName(req);

    expect(restaurantName).to.equal("דיקסי");
  });

  it("getRestaurantName() should return an empty restaruant name from request with only command", function() {
    let req = new HipChatModule.HipChatReq(deepCopy(message));
    req.body.item.message.message = "/10bis";
    var restaurantName = hipChatMessage.getRestaurantName(req);

    expect(restaurantName).to.equal("");
  });

  it("getRestaurantName() should return null with bad field", function() {
    let req = new HipChatModule.HipChatReq(deepCopy(message));
    req.body.item.message.message = null;
    var restaurantName = hipChatMessage.getRestaurantName(req);

    expect(restaurantName).to.equal(null);
  });

  it("getErrorMessage() should return a valid error message without restaurants name", function() {
    let expectedResponse = deepCopy(errorResponse);
    var response = hipChatMessage.getErrorMessage(null);

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message).to.equal(expectedResponse.message);
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

    it("getErrorMessage() should return a valid error message with passed restaurants name", function() {
    let expectedResponse = deepCopy(errorResponse);
    var response = hipChatMessage.getErrorMessage("גוטה");

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message).to.equal(expectedResponse.message + " for: גוטה");
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

  it("generateRestaurantCard() should return a valid card", function() {
    var restaruant = {
      RestaurantName: "דיקסי",
      RestaurantId: 123,
      MinimumOrder: "26 שח",
      DeliveryPrice: "10 שח",
      RestaurantCuisineList: "מסעדה אמריקאית",
      RestaurantLogoUrl: validCard.thumbnail.url
    };

    var response = hipChatMessage.generateRestaurantCard(restaruant);

      // Can"t do the following due to on the spot generation of guid and time
      // expect(response).to.deep.equal(validCard);
      expect(helper.compareKeys(response, validCard)).to.equal(true);

      expect(response.description).to.equal(validCard.description);
      expect(response.icon.url).to.equal(validCard.icon.url);
      expect(response.style).to.equal(validCard.style);
      expect(response.thumbnail.url).to.equal(validCard.thumbnail.url);
      expect(response.title).to.equal(validCard.title);
      expect(response.url).to.equal(validCard.url);
  });

  it("generateTotalOrdersResponse() should return a valid message without restaurant list", function() {
    let expectedResponse = deepCopy(goodResponse);
    var response = hipChatMessage.generateTotalOrdersResponse([]);

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message).to.equal("No pool order restaurants found");
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

    it("generateTotalOrdersResponse() should return a valid message with restaurant list", function() {
    let expectedResponse = deepCopy(goodResponse);
    var response = hipChatMessage.generateTotalOrdersResponse(helper.restaurants);

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message.includes("[1]")).to.equal(true);
    expect(response.message.includes("[2]")).to.equal(true);
    expect(response.message.includes("[3]")).to.equal(false);
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });


});