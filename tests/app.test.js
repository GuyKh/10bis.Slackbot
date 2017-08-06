// tests/app.test.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var rewire = require('rewire');
var app = rewire('./../src/app.js');
var slackMessageFormatter = require('./../src/slackMessage.js');
var hipChatMessageFormatter = require('./../src/hipChatMessage.js');

var slackValidMessage = '{' +
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

var validHipChatMessage = '{ "event": "room_message",       ' +
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

var slackInvalidMessage = '{' +
   '"token":"ItoB7oEyZIbNmHPfxHQ2GrbC",' +
   '"team_id":"T0001",' +
   '"team_domain":"example",' +
   '"channel_id":"C2147483705",' +
   '"channel_name":"test",' +
   '"user_id":"U2147483697",' +
   '"user_name":"Steve"' +
'}';

var hipChatInvalidMessage = '{ "event": "room_message",     ' +
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

describe('App', function () {
            it('verifyMessage() should return null if no items are passed in', function () {
                var verifyMessage = app.__get__('verifyMessage');

                var req = {};
                req.body = JSON.parse(slackValidMessage);

                expect(verifyMessage(null)).to.equal(null);
                expect(verifyMessage(null, [slackMessageFormatter, hipChatMessageFormatter])).to.equal(null);
                expect(verifyMessage(req, null)).to.equal(null);
            });

            it('verifyMessage() should return slackMessageFormatter if valid slack message is passed', function () {
                var verifyMessage = app.__get__('verifyMessage');

                var req = {};
                req.body = JSON.parse(slackValidMessage);
                expect(verifyMessage(req, [slackMessageFormatter, hipChatMessageFormatter])).to.equal(slackMessageFormatter);
            });

            it('verifyMessage() should return hipChatMessage if valid HipChat message is passed', function () {
                var verifyMessage = app.__get__('verifyMessage');

                var req = {};
                req.body = JSON.parse(validHipChatMessage);
                expect(verifyMessage(req, [slackMessageFormatter, hipChatMessageFormatter])).to.equal(hipChatMessageFormatter);
            });

            it('verifyMessage() should return null if invalid Slack message is passed', function () {
                var verifyMessage = app.__get__('verifyMessage');

                var req = {};
                req.body = JSON.parse(slackInvalidMessage);
                expect(verifyMessage(req, [slackMessageFormatter, hipChatMessageFormatter])).to.equal(undefined);
            });

            it('verifyMessage() should return null if invalid HipChat message is passed', function () {
                var verifyMessage = app.__get__('verifyMessage');

                var req = {};
                req.body = JSON.parse(hipChatInvalidMessage);
                expect(verifyMessage(req, [slackMessageFormatter, hipChatMessageFormatter])).to.equal(undefined);
            });

            
            it('generateRequest() should return a valid request', function () {
                var generateRequest = app.__get__('generateRequest');

                var now = new Date();

                var generatedRequest = generateRequest("Rest");

                expect(generatedRequest).not.to.equal(undefined);
                expect(generatedRequest.includes('searchPhrase=Rest')).to.be.true;
            });

            it('filterByRestaurantName() should filter restaurants with the same name', function () {
                var filterByRestaurantName = app.__get__('filterByRestaurantName');

                var restaurant1 = {
                    RestaurantName: 'Rest1',
                    RestaurantId: 1
                };

                var restaurant2 = {
                    RestaurantName: 'Rest2',
                    RestaurantId: 2
                };

                var restaurant3 = {
                    RestaurantName: 'Rest1',
                    RestaurantId: 3
                };
                
                var result = filterByRestaurantName([restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(undefined);
                expect(result.length).to.equal(2);
                expect(result.some(function(element, index){return element.RestaurantName=="Rest1"})).to.be.true;
                expect(result.some(function(element, index){return element.RestaurantName=="Rest2"})).to.be.true;
            });

               it('filterByRestaurantName() should be ok with an empty array', function () {
                var filterByRestaurantName = app.__get__('filterByRestaurantName');
                
                var result = filterByRestaurantName([]);

                expect(result).not.to.equal(undefined);
                expect(result.length).to.equal(0);
            });

            it('filterByRestaurantName() should filter restaurants with the same name', function () {
                var filterByRestaurantName = app.__get__('filterByRestaurantName');

                var restaurant1 = {
                    RestaurantName: 'Rest1',
                    RestaurantId: 1
                };

                var restaurant2 = {
                    RestaurantName: 'Rest2',
                    RestaurantId: 2
                };

                var restaurant3 = {
                    RestaurantName: 'Rest1',
                    RestaurantId: 3
                };
                
                var result = filterByRestaurantName([restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(undefined);
                expect(result.length).to.equal(2);
                expect(result.some(function(element, index){return element.RestaurantName=="Rest1"})).to.be.true;
                expect(result.some(function(element, index){return element.RestaurantName=="Rest2"})).to.be.true;
            });

            it('generateResponse() should return valid answer', function () {
                var generateResponse = app.__get__('generateResponse');

                var restaurant1 = {
                    RestaurantName: 'Rest1',
                    RestaurantId: 1
                };

                var restaurant2 = {
                    RestaurantName: 'Rest2',
                    RestaurantId: 2
                };

                var restaurant3 = {
                    RestaurantName: 'Rest3',
                    RestaurantId: 3
                };
                
                var result = generateResponse([restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(undefined);
                expect(result.length).to.equal(2);
                expect(result[0]).to.equal('Found 3 restaurants');
                expect(result[1]).not.to.equal('');
                expect(result[1].includes('[1] Rest1')).to.be.true;
                expect(result[1].includes('[2] Rest2')).to.be.true;
                expect(result[1].includes('[3] Rest3')).to.be.true;
            });

            it('generateResponse() should return valid answer with 0 results', function () {
                var generateResponse = app.__get__('generateResponse');

                var result = generateResponse([]);

                expect(result).not.to.equal(undefined);
                expect(result.length).to.equal(2);
                expect(result[0]).to.equal('Found 0 restaurants');
                expect(result[1]).to.equal('');
            });

            it('sortRestaurantsByDistance() should sort restaurants by distance', function () {
                var sortRestaurantsByDistance = app.__get__('sortRestaurantsByDistance');

                var restaurant1 = {
                    RestaurantName: 'Rest1',
                    RestaurantId: 1,
                    distanceFromUserInMeters: 10
                };

                var restaurant2 = {
                    RestaurantName: 'Rest2',
                    distanceFromUserInMeters: 20
                };

                var restaurant3 = {
                    RestaurantName: 'Rest3',
                    distanceFromUserInMeters: 15
                };
                
                var result = sortRestaurantsByDistance([restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(undefined);
                expect(result.length).to.equal(3);
                expect(result[0].RestaurantName).to.be.equal('Rest1');
                expect(result[1].RestaurantName).to.be.equal('Rest3');
                expect(result[2].RestaurantName).to.be.equal('Rest2');
            });

            it('sortRestaurantsByDistance() should do nothing when fields are equal', function () {
                var sortRestaurantsByDistance = app.__get__('sortRestaurantsByDistance');

                var restaurant1 = {
                    RestaurantName: 'Rest1',
                    RestaurantId: 1,
                    distanceFromUserInMeters: 15
                };

                var restaurant2 = {
                    RestaurantName: 'Rest2',
                    distanceFromUserInMeters: 7
                };

                var restaurant3 = {
                    RestaurantName: 'Rest3',
                    distanceFromUserInMeters: 7
                };
                
                var result = sortRestaurantsByDistance([restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(undefined);
                expect(result.length).to.equal(3);
                expect(result[0].RestaurantName).to.be.equal('Rest2');
                expect(result[1].RestaurantName).to.be.equal('Rest3');
                expect(result[2].RestaurantName).to.be.equal('Rest1');
            });

            it('sortRestaurantsByDistance() should do nothing when no field', function () {
                var sortRestaurantsByDistance = app.__get__('sortRestaurantsByDistance');

                var restaurant1 = {
                    RestaurantName: 'Rest1',
                    RestaurantId: 1,
                };

                var restaurant2 = {
                    RestaurantName: 'Rest2',
                };

                var restaurant3 = {
                    RestaurantName: 'Rest3',
                };
                
                var result = sortRestaurantsByDistance([restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(undefined);
                expect(result.length).to.equal(3);
                expect(result[0].RestaurantName).to.be.equal('Rest1');
                expect(result[1].RestaurantName).to.be.equal('Rest2');
                expect(result[2].RestaurantName).to.be.equal('Rest3');
            });
});