import { SlackModule } from "../src/slackModule";
import { deepCopy, restaurants } from "./commons";
import { SlackMessageFormatter } from "../src/slackMessage";
import { Commons } from "../src/commons";

// tests/slackMessage.test.js
var chai = require("chai");
var expect = chai.expect; // we are using the "expect" style of Chai
let slackMessage = SlackMessageFormatter.getInstance();

let message = new SlackModule.SlackMessage("ItoB7oEyZIbNmHPfxHQ2GrbC", "T0001", "example",
                "C2147483705", "test", "U2147483697", "Steve", "/10bis", "דיקסי");

let goodResponse = new SlackModule.SlackResponse("in_channel", "Found 0 restaurants", []);
goodResponse.attachments.push(new SlackModule.SlackAttachment(null, null, null, null, "List", null, null));

let validCard = new SlackModule.SlackAttachment(
  "דיקסי : https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=123",
  "דיקסי",
  "#36a64f",
  "https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=123",
  "מסעדה אמריקאית",
  "http://image.jpg",
  (Math.floor(Date.now() / 1000))
  );
validCard.fields = [
  new SlackModule.SlackAttachmentField("מינימום הזמנה", "26 שח", true),
  new SlackModule.SlackAttachmentField("דמי משלוח", "10 שח", true)
];


let validTotalCard = new SlackModule.SlackAttachment(
  "דיקסי : https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=123",
  "דיקסי",
  "#36a64f",
  "https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=123",
  "מסעדה אמריקאית",
  "http://image.jpg",
  (Math.floor(Date.now() / 1000))
);

validTotalCard.fields = [
  new SlackModule.SlackAttachmentField("הוזמן עד כה", "₪ 90.00", true),
  new SlackModule.SlackAttachmentField("מינימום הזמנה", "₪70.00", true)
];

let errorResponse = new SlackModule.SlackResponse("ephemeral", "No Restaurants Found", null);

describe("SlackMessage", function() {
  describe("Basic methods and module", function() {
  it("should have a generateSearchResponse Method", function() {
    expect(typeof slackMessage).to.equal("object");
    expect(typeof slackMessage.generateSearchResponse).to.equal("function");
  });
  it("should have a generateTotalOrdersResponse Method", function() {
    expect(typeof slackMessage).to.equal("object");
    expect(typeof slackMessage.generateTotalOrdersResponse).to.equal("function");
  });
  it("should have a generateRestaurantCard Method", function() {
    expect(typeof slackMessage).to.equal("object");
    expect(typeof slackMessage.generateRestaurantCard).to.equal("function");
  });
  it("should have a generateRestaurantTotalCard Method", function() {
    expect(typeof slackMessage).to.equal("object");
    expect(typeof slackMessage.generateRestaurantTotalCard).to.equal("function");
  });
  it("should have a getErrorMessage Method", function() {
    expect(typeof slackMessage).to.equal("object");
    expect(typeof slackMessage.getErrorMessage).to.equal("function");
  });
  it("should have a getRestaurantName Method", function() {
    expect(typeof slackMessage).to.equal("object");
    expect(typeof slackMessage.getRestaurantName).to.equal("function");
  });
  it("should have a isValidMessage Method", function() {
    expect(typeof slackMessage).to.equal("object");
    expect(typeof slackMessage.isValidMessage).to.equal("function");
  });
});
  it("isValidMessage() should return true if default format message is sent", function() {
    let req = new SlackModule.SlackRequest(deepCopy(message));
    expect(slackMessage.isValidMessage(req)).to.equal(true);
  });

  it("isValidMessage() should return false if message body is passing null", function() {
    expect(slackMessage.isValidMessage(null)).to.equal(false);
  });

  it("isValidMessage() should return false if message body is missing", function() {
    let req = new  SlackModule.SlackRequest(null);
    expect(slackMessage.isValidMessage(req)).to.equal(false);
  });

  it("isValidMessage() should return false if request body is missing", function() {
    var req = null;
    expect(slackMessage.isValidMessage(req)).to.equal(false);
  });

  it("isValidMessage() should return true if message body is only the command", function() {
    var req = new SlackModule.SlackRequest(null);
    req.body = deepCopy(message);
    req.body.command = "/10bis";
    req.body.text = "";
    expect(slackMessage.isValidMessage(req)).to.equal(true);
  });

  it("isValidMessage() should return true if message body doesn't start with the command", function() {
    var req = new SlackModule.SlackRequest(null);
    req.body = deepCopy(message);
    req.body.command = "/test";
    expect(slackMessage.isValidMessage(req)).to.equal(false);
  });

  it("generateSearchResponse() should return a valid message without restaurant list", function() {
    var expectedResponse = deepCopy(goodResponse);
    var response = slackMessage.generateSearchResponse([]);

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal(expectedResponse.text);
    expect(response.attachments).to.equal(null);
  });

    it("generateSearchResponse() should return a valid message with restaurant list", function() {
    var expectedResponse = deepCopy(goodResponse);
    var response = slackMessage.generateSearchResponse(restaurants);

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal("Found 2 restaurants");
    expect(response.attachments).not.equal(null);
    expect(response.attachments.length).to.equal(2);
  });

  it("getRestaurantName() should return right restaruant name from request", function() {
    let req = new SlackModule.SlackRequest(deepCopy(message));
    var restaurantName = slackMessage.getRestaurantName(req);

    expect(restaurantName).to.equal("דיקסי");
  });

  it("getRestaurantName() should return an empty restaruant name from request with only command", function() {
    var req = new SlackModule.SlackRequest(null);
    req.body = deepCopy(message);
    req.body.text = "";
    var restaurantName = slackMessage.getRestaurantName(req);

    expect(restaurantName).to.equal("");
  });

  it("getRestaurantName() should return null with bad field", function() {
    var req = new SlackModule.SlackRequest(null);
    req.body = deepCopy(message);
    req.body.text = null;
    var restaurantName = slackMessage.getRestaurantName(req);

    expect(restaurantName).to.equal(null);
  });

  it("getErrorMessage() should return a valid error message without restaurants name", function() {
    var expectedResponse = deepCopy(errorResponse);
    var response = <SlackModule.SlackResponse> slackMessage.getErrorMessage(null);

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal(expectedResponse.text);
  });

  it("getErrorMessage() should return a valid error message with passed restaurants name", function() {
    var expectedResponse = deepCopy(errorResponse);
    var response = <SlackModule.SlackResponse> slackMessage.getErrorMessage("גוטה");

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal(expectedResponse.text + " for: גוטה");
  });

  it("generateRestaurantCard() should return a valid card", function() {

    let restaruant = new Commons.RestaurantBuilder()
      .setRestaurantName( "דיקסי")
      .setRestaurantId(123)
      .setMinimumOrder("26 שח")
      .setDeliveryPrice("10 שח")
      .setRestaurantCuisineList("מסעדה אמריקאית")
      .setRestaurantLogoUrl("http://image.jpg")
      .build();

    var response = slackMessage.generateRestaurantCard(restaruant);

    // Can"t do the following due to on the spot generation of guid and time
    // expect(response).to.deep.equal(validCard);

    expect(response.color).to.equal(validCard.color);
    expect(response.fallback).to.equal(validCard.fallback);
    expect(response.fields).to.deep.equal(validCard.fields);
    expect(response.text).to.equal(validCard.text);
    expect(response.title).to.equal(validCard.title);
    expect(response.title_link).to.equal(validCard.title_link);

  });

  it("generateTotalOrdersResponse() should return a valid message without restaurant list", function() {
    var expectedResponse = deepCopy(goodResponse);
    var response = slackMessage.generateTotalOrdersResponse([]);

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal("No pool order restaurants found");
    expect(response.attachments).to.equal(null);
  });

    it("generateTotalOrdersResponse() should return a valid message with restaurant list", function() {
    var expectedResponse = deepCopy(goodResponse);
    var response = slackMessage.generateTotalOrdersResponse(restaurants);

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal("Found 2 restaurants");
    expect(response.attachments).not.equal(null);
    expect(response.attachments.length).to.equal(2);
  });

  it("generateRestaurantTotalCard() should return a valid card", function() {
    let restaruant = new Commons.RestaurantBuilder()
      .setRestaurantName("דיקסי")
      .setRestaurantId(123)
      .setMinimumOrder("₪70.00")
      .setPoolSum("₪ 90.00")
      .setRestaurantCuisineList("מסעדה אמריקאית")
      .setRestaurantLogoUrl("http://image.jpg")
      .build();

    var response = slackMessage.generateRestaurantTotalCard(restaruant);

    // Can"t do the following due to on the spot generation of guid and time
    // expect(response).to.deep.equal(validCard);

    expect(response.color).to.equal(validTotalCard.color);
    expect(response.fallback).to.equal(validTotalCard.fallback);
    expect(response.fields).to.deep.equal(validTotalCard.fields);
    expect(response.text).to.equal(validTotalCard.text);
    expect(response.title).to.equal(validTotalCard.title);
    expect(response.title_link).to.equal(validTotalCard.title_link);

  });
});