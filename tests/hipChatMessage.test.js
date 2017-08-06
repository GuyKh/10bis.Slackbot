// tests/hipChatMessage.test.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var hipChatMessage = require('./../src/hipChatMessage.js');

var message = '{ "event": "room_message",                   ' +
    '"item": {                                              ' +
        '"message": {                                       ' +
            '"date": "2015-01-20T22:45:06.662545+00:00",    ' +
            '"from": {                                      ' +
                '"id": 1661743,                             ' +
                '"mention_name": "Blinky",                  ' +
                '"name": "Blinky the Three Eyed Fish"       ' +
            '},                                             ' +
            '"id": "00a3eb7f-fac5-496a-8d64-a9050c712ca1",  ' +
            '"mentions": [],                                ' +
            '"message": "/10bis דיקסי",                       ' +
            '"type": "message"                              ' +
        '},                                                 ' +
        '"room": {                                          ' +
            '"id": 1147567,                                 ' +
            '"name": "The Weather Channel"                  ' +
        '}                                                  ' +
    '},                                                     ' +
    '"webhook_id": 578829                                   ' +
'}';

var badMessage = '{ "event": "room_message",                ' +
    '"item": {                                              ' +
        '"message": {                                       ' +
            '"date": "2015-01-20T22:45:06.662545+00:00",    ' +
            '"from": {                                      ' +
                '"id": 1661743,                             ' +
                '"mention_name": "Blinky",                  ' +
                '"name": "Blinky the Three Eyed Fish"       ' +
          '},                                               ' +
            '"id": "00a3eb7f-fac5-496a-8d64-a9050c712ca1",  ' +
            '"mentions": [],                                ' +
            '"type": "message"                              ' +
        '},                                                 ' +
        '"room": {                                          ' +
            '"id": 1147567,                                 ' +
            '"name": "The Weather Channel"                  ' +
        '}                                                  ' +
    '},                                                     ' +
    '"webhook_id": 578829                                   ' +
'}';

var goodResponse = '{                                     ' +
    '"color": "green",                                    ' +
    '"message": "Title",                                  ' +
    '"notify": false,                                     ' +
    '"message_format": "text"                             ' +
'}';

var errorResponse = '{                                    ' +
    '"color": "red",                                      ' +
    '"message": "No Restaurants Found",                   ' +
    '"notify": false,                                     ' +
    '"message_format": "text"                             ' +
'}';


describe('HipChatMessage', function() {
  it('isValidMessage() should return true if default format message is sent', function() {
    var req = {};
    req.body = JSON.parse(message);
    expect(hipChatMessage.isValidMessage(req)).to.equal(true);
  });

  it('isValidMessage() should return false if message body is passing null', function() {
    expect(hipChatMessage.isValidMessage(null)).to.equal(false);
  });

  it('isValidMessage() should return false if message body is missing', function() {
    var req = {};
    req.body = JSON.parse(badMessage);
    expect(hipChatMessage.isValidMessage(req)).to.equal(false);
  });

  it('isValidMessage() should return false if request body is missing', function() {
    var req = {};
    expect(hipChatMessage.isValidMessage(req)).to.equal(false);
  });

  it('isValidMessage() should return true if message body is only the command', function() {
    var req = {};
    req.body = JSON.parse(message);
    req.body.item.message.message = "/10bis";
    expect(hipChatMessage.isValidMessage(req)).to.equal(true);
  });

  it('isValidMessage() should return true if message body doesn\'t start with the command', function() {
    var req = {};
    req.body = JSON.parse(message);
    req.body.item.message.message = "/test";
    expect(hipChatMessage.isValidMessage(req)).to.equal(false);
  });

  it('getSuccessMessage() should return a valid message without restaurant list', function() {
    var expectedResponse = JSON.parse(goodResponse);
    var response = hipChatMessage.getSuccessMessage("Title", null);

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message).to.equal(expectedResponse.message);
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

    it('getSuccessMessage() should return a valid message with restaurant list', function() {
    var expectedResponse = JSON.parse(goodResponse);
    var response = hipChatMessage.getSuccessMessage("Title", "List");

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message).to.equal(expectedResponse.message + "\n List");
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

  it('getRestaurantName() should return right restaruant name from request', function() {
    var req = {};
    req.body = JSON.parse(message);
    var restaurantName = hipChatMessage.getRestaurantName(req);

    expect(restaurantName).to.equal("דיקסי");
  });

  it('getRestaurantName() should return an empty restaruant name from request with only command', function() {
    var req = {};
    req.body = JSON.parse(message);
    req.body.item.message.message = "/10bis";
    var restaurantName = hipChatMessage.getRestaurantName(req);

    expect(restaurantName).to.equal("");
  });

  it('getRestaurantName() should return null with bad field', function() {
    var req = {};
    req.body = JSON.parse(message);
    req.body.item.message.message = null;
    var restaurantName = hipChatMessage.getRestaurantName(req);

    expect(restaurantName).to.equal(null);
  });

  it('getErrorMessage() should return a valid error message without restaurants name', function() {
    var expectedResponse = JSON.parse(errorResponse);
    var response = hipChatMessage.getErrorMessage(null);

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message).to.equal(expectedResponse.message);
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });

    it('getErrorMessage() should return a valid error message with passed restaurants name', function() {
    var expectedResponse = JSON.parse(errorResponse);
    var response = hipChatMessage.getErrorMessage("גוטה");

    expect(response.color).to.equal(expectedResponse.color);
    expect(response.message).to.equal(expectedResponse.message + " for: גוטה");
    expect(response.notify).to.equal(expectedResponse.notify);
    expect(response.message_format).to.equal(expectedResponse.message_format);
  });


});