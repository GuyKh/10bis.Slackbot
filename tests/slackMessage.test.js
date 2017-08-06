// tests/slackMessage.test.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var slackMessage = require('./../src/slackMessage.js');

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

var badMessage = '{' +
   '"token":"ItoB7oEyZIbNmHPfxHQ2GrbC",' +
   '"team_id":"T0001",' +
   '"team_domain":"example",' +
   '"channel_id":"C2147483705",' +
   '"channel_name":"test",' +
   '"user_id":"U2147483697",' +
   '"user_name":"Steve",' +
   '"command":"/10bis"' +
'}';

var goodResponse = '{' +
    '"response_type":"in_channel",' +
    '"text":"Title",' +
    '"attachments":[' +
        '{' +
            '"text":"List"' +
        '}' +
    ']' +
'}';

var errorResponse = '{' +
    '"response_type":"ephemeral",' +
    '"text":"No Restaurants Found"' +
'}';

describe('SlackMessage', function() {
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

  it('getSuccessMessage() should return a valid message without restaurant list', function() {
    var expectedResponse = JSON.parse(goodResponse);
    var response = slackMessage.getSuccessMessage("Title", null);

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal(expectedResponse.text);
    expect(response.attachments.text).to.equal(undefined);
  });

    it('getSuccessMessage() should return a valid message with restaurant list', function() {
    var expectedResponse = JSON.parse(goodResponse);
    var response = slackMessage.getSuccessMessage("Title", "List");

    expect(response.response_type).to.equal(expectedResponse.response_type);
    expect(response.text).to.equal(expectedResponse.text);
    expect(response.attachments.text).to.equal(expectedResponse.attachments.text);
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


});