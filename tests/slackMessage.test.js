// tests/slackMessage.test.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var slackMessage = require('./../src/slackMessage.js');
var helper = require('./helper.js');

var message = '{' +
   '"token":"ItoB7oEyZIbNmHPfxHQ2GrbC",' +
   '"team_id":"T0001",' +
   '"team_domain":"example",' +
   '"channel_id":"C2147483705",' +
   '"channel_name":"test",' +
   '"user_id":"U2147483697",' +
   '"user_name":"Steve",' +
   '"command":"/10bis",' +
   '"text":"דיקסי"' +
'}';

var goodResponse = '{' +
    '"response_type":"in_channel",' +
    '"text":"Found 0 restaurants",' +
    '"attachments":[' +
        '{' +
            '"text":"List"' +
        '}' +
    ']' +
'}';

var validCard = {
  fallback: "דיקסי : https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=123",
  title: "דיקסי",
  color: '#36a64f',
  title_link: "https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=123",
  text: "מסעדה אמריקאית",
  fields: [
      {
      "title": "מינימום הזמנה",
      "value": "26 שח",
      "short": true
      },
      {
      "title": "דמי משלוח",
      "value": "10 שח",
      "short": true
      }
  ],
  thumb_url: "http://image.jpg",
  ts: (Math.floor(Date.now() / 1000))
};

var validTotalCard = {
  fallback: "דיקסי : https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=123",
  title: "דיקסי",
  color: '#36a64f',
  title_link: "https://www.10bis.co.il/Restaurants/Menu/Delivery?ResId=123",
  text: "מסעדה אמריקאית",
  fields: [
      {
      "title": "הוזמן עד כה",
      "value": "₪ 90.00",
      "short": true
      },
      {
      "title": "מינימום הזמנה",
      "value": "₪70.00",
      "short": true
      }
  ],
  thumb_url: "http://image.jpg",
  ts: (Math.floor(Date.now() / 1000))
};

var errorResponse = '{' +
    '"response_type":"ephemeral",' +
    '"text":"No Restaurants Found"' +
'}';

describe('SlackMessage', function() {
  describe('Basic methods and module', function() {
  it('should have a generateSearchResponse Method', function(){
    expect(typeof slackMessage).to.equal('object');
    expect(typeof slackMessage.generateSearchResponse).to.equal('function');
  });
  it('should have a generateTotalOrdersResponse Method', function(){
    expect(typeof slackMessage).to.equal('object');
    expect(typeof slackMessage.generateTotalOrdersResponse).to.equal('function');
  });
  it('should have a generateRestaurantCard Method', function(){
    expect(typeof slackMessage).to.equal('object');
    expect(typeof slackMessage.generateRestaurantCard).to.equal('function');
  });
  it('should have a generateRestaurantTotalCard Method', function(){
    expect(typeof slackMessage).to.equal('object');
    expect(typeof slackMessage.generateRestaurantTotalCard).to.equal('function');
  });
  it('should have a getErrorMessage Method', function(){
    expect(typeof slackMessage).to.equal('object');
    expect(typeof slackMessage.getErrorMessage).to.equal('function');
  });
  it('should have a getRestaurantName Method', function(){
    expect(typeof slackMessage).to.equal('object');
    expect(typeof slackMessage.getRestaurantName).to.equal('function');
  });
  it('should have a isValidMessage Method', function(){
    expect(typeof slackMessage).to.equal('object');
    expect(typeof slackMessage.isValidMessage).to.equal('function');
  });
});
  it('isValidMessage() should return true if default format message is sent', function() {
    var req = {};
    req.body = JSON.parse(message);
    expect(slackMessage.isValidMessage(req)).to.equal(true);
  });

  it('isValidMessage() should return false if message body is passing null', function() {
    expect(slackMessage.isValidMessage(null)).to.equal(false);
  });

  it('isValidMessage() should return false if message body is missing', function() {
    var req = {};
    req.body = null;
    expect(slackMessage.isValidMessage(req)).to.equal(false);
  });

  it('isValidMessage() should return false if request body is missing', function() {
    var req = {};
    expect(slackMessage.isValidMessage(req)).to.equal(false);
  });

  it('isValidMessage() should return true if message body is only the command', function() {
    var req = {};
    req.body = JSON.parse(message);
    req.body.command = "/10bis";
    req.body.text = "";
    expect(slackMessage.isValidMessage(req)).to.equal(true);
  });

  it('isValidMessage() should return true if message body doesn\'t start with the command', function() {
    var req = {};
    req.body = JSON.parse(message);
    req.body.command = "/test";
    expect(slackMessage.isValidMessage(req)).to.equal(false);
  });

  it('generateSearchResponse() should return a valid message without restaurant list', function() {
    var expectedResponse = JSON.parse(goodResponse);
    var response = slackMessage.generateSearchResponse([]);

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal(expectedResponse.text);
    expect(response).not.to.have.property('attachments');
  });

    it('generateSearchResponse() should return a valid message with restaurant list', function() {
    var expectedResponse = JSON.parse(goodResponse);
    var response = slackMessage.generateSearchResponse(helper.restaurants);

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal("Found 2 restaurants");
    expect(response.attachments).not.equal(null);
    expect(response.attachments.length).to.equal(2);
  });

  it('getRestaurantName() should return right restaruant name from request', function() {
    var req = {};
    req.body = JSON.parse(message);
    var restaurantName = slackMessage.getRestaurantName(req);

    expect(restaurantName).to.equal("דיקסי");
  });

  it('getRestaurantName() should return an empty restaruant name from request with only command', function() {
    var req = {};
    req.body = JSON.parse(message);
    req.body.text = "";
    var restaurantName = slackMessage.getRestaurantName(req);

    expect(restaurantName).to.equal("");
  });

  it('getRestaurantName() should return null with bad field', function() {
    var req = {};
    req.body = JSON.parse(message);
    req.body.text = null;
    var restaurantName = slackMessage.getRestaurantName(req);

    expect(restaurantName).to.equal(null);
  });

  it('getErrorMessage() should return a valid error message without restaurants name', function() {
    var expectedResponse = JSON.parse(errorResponse);
    var response = slackMessage.getErrorMessage(null);

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal(expectedResponse.text);
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

  it('getErrorMessage() should return a valid error message with passed restaurants name', function() {
    var expectedResponse = JSON.parse(errorResponse);
    var response = slackMessage.getErrorMessage("גוטה");

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal(expectedResponse.text + " for: גוטה");
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

  it('generateRestaurantCard() should return a valid card', function() {
    var restaruant = {
      RestaurantName: "דיקסי",
      RestaurantId: 123,
      MinimumOrder: "26 שח",
      DeliveryPrice: "10 שח",
      RestaurantCuisineList: "מסעדה אמריקאית",
      RestaurantLogoUrl: "http://image.jpg"
    };

    var response = slackMessage.generateRestaurantCard(restaruant);

    // Can't do the following due to on the spot generation of guid and time
    // expect(response).to.deep.equal(validCard);

    expect(response.color).to.equal(validCard.color);
    expect(response.fallback).to.equal(validCard.fallback);
    expect(response.fields).to.deep.equal(validCard.fields);
    expect(response.text).to.equal(validCard.text);
    expect(response.title).to.equal(validCard.title);
    expect(response.title_link).to.equal(validCard.title_link);

  });

  it('generateTotalOrdersResponse() should return a valid message without restaurant list', function() {
    var expectedResponse = JSON.parse(goodResponse);
    var response = slackMessage.generateTotalOrdersResponse([]);

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal("No pool order restaurants found");
    expect(response).not.to.have.property('attachments');
  });

    it('generateTotalOrdersResponse() should return a valid message with restaurant list', function() {
    var expectedResponse = JSON.parse(goodResponse);
    var response = slackMessage.generateTotalOrdersResponse(helper.restaurants);

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal("Found 2 restaurants");
    expect(response.attachments).not.equal(null);
    expect(response.attachments.length).to.equal(2);
  });

  it('generateRestaurantTotalCard() should return a valid card', function() {
    var restaruant = {
      RestaurantName: "דיקסי",
      RestaurantId: 123,
      MinimumOrder: "₪70.00",
      PoolSum: "₪ 90.00",
      RestaurantCuisineList: "מסעדה אמריקאית",
      RestaurantLogoUrl: "http://image.jpg"
    };

    var response = slackMessage.generateRestaurantTotalCard(restaruant);

    // Can't do the following due to on the spot generation of guid and time
    // expect(response).to.deep.equal(validCard);

    expect(response.color).to.equal(validTotalCard.color);
    expect(response.fallback).to.equal(validTotalCard.fallback);
    expect(response.fields).to.deep.equal(validTotalCard.fields);
    expect(response.text).to.equal(validTotalCard.text);
    expect(response.title).to.equal(validTotalCard.title);
    expect(response.title_link).to.equal(validTotalCard.title_link);

  });
});