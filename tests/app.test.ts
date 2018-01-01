import { Commons } from "../src/commons";
import { HipChatModule } from "../src/hipChatModule";
import { SlackModule } from "../src/slackModule";
import { SlackMessageFormatter } from "../src/slackMessage";
import { HipChatMessageFormatter } from "../src/hipChatMessage";
import { restaurants } from "./commons";

var chai = require("chai");
var expect = chai.expect; // we are using the "expect" style of Chai
var rewire = require("rewire");
var app = rewire("./../src/app.js");
var slackMessageFormatter = SlackMessageFormatter.getInstance();
var hipChatMessageFormatter = HipChatMessageFormatter.getInstance();

var validSlackMessage = new SlackModule.SlackMessage(
    "ItoB7oEyZIbNmHPfxHQ2GrbC",
    "T0001",
    "example",
    "C2147483705",
    "test",
    "U2147483697",
    "Steve",
    "/10bis",
    "דיקסי"
);

var validHipChatMessage = new HipChatModule.HipChatReqBody(
                            "room_message",
                            new HipChatModule.HipChatReqItem(
                                    new HipChatModule.HipChatReqItemMessage(
                                        new Date("2015-01-20T22:45:06.662545+00:00"),
                                        new HipChatModule.HipChatReqItemMessageFrom(1661743, "Blinky", "Blinky the Three Eyed Fish"),
                                         "00a3eb7f-fac5-496a-8d64-a9050c712ca1",
                                         [],
                                         "/10bis דיקסי",
                                         "message"),
                                         new HipChatModule.HipChatReqItemRoom(1147567, "The Weather Channel")),
                            578829);


var slackInvalidMessage = new SlackModule.SlackMessage(
    "ItoB7oEyZIbNmHPfxHQ2GrbC",
    "T0001",
    "example",
    "C2147483705",
    "test",
    "U2147483697",
    "Steve",
    null,
    null
);

var hipChatInvalidMessage = new HipChatModule.HipChatReqBody(
    "room_message",
    new HipChatModule.HipChatReqItem(
            new HipChatModule.HipChatReqItemMessage(
                new Date("2015-01-20T22:45:06.662545+00:00"),
                new HipChatModule.HipChatReqItemMessageFrom(1661743, "Blinky", "Blinky the Three Eyed Fish"),
                 "00a3eb7f-fac5-496a-8d64-a9050c712ca1",
                 [],
                 null,
                 "message"),
                 new HipChatModule.HipChatReqItemRoom(1147567, "The Weather Channel")),
    578829);

export class Req {
    body: string;

    constructor (body: string) {
        this.body = body;
    }
}

describe("App", function () {
    describe("Basic methods and module", function() {
        it("should have a process Method", function() {
          expect(typeof app).to.equal("object");
          expect(typeof app.process).to.equal("function");
        });
    });

            it("verifyMessage() should return null if no items are passed in", function () {
                var verifyMessage = app.__get__("verifyMessage");

                let req = new SlackModule.SlackRequest(validSlackMessage);

                expect(verifyMessage(null)).to.equal(null);
                expect(verifyMessage(null, [slackMessageFormatter, hipChatMessageFormatter])).to.equal(null);
                expect(verifyMessage(req, null)).to.equal(null);
            });

            it("verifyMessage() should return slackMessageFormatter if valid slack message is passed", function () {
                var verifyMessage = app.__get__("verifyMessage");

                let req = new SlackModule.SlackRequest(validSlackMessage);
                expect(verifyMessage(req, [slackMessageFormatter, hipChatMessageFormatter])).to.equal(slackMessageFormatter);
            });

            it("verifyMessage() should return hipChatMessage if valid HipChat message is passed", function () {
                var verifyMessage = app.__get__("verifyMessage");

                let req = new HipChatModule.HipChatReq(validHipChatMessage);
                expect(verifyMessage(req, [slackMessageFormatter, hipChatMessageFormatter])).to.equal(hipChatMessageFormatter);
            });

            it("verifyMessage() should return null if invalid Slack message is passed", function () {
                var verifyMessage = app.__get__("verifyMessage");

                let req = new SlackModule.SlackRequest(slackInvalidMessage);
                expect(verifyMessage(req, [slackMessageFormatter, hipChatMessageFormatter])).to.be.an("undefined");
            });

            it("verifyMessage() should return null if invalid HipChat message is passed", function () {
                var verifyMessage = app.__get__("verifyMessage");

                let req = new HipChatModule.HipChatReq(hipChatInvalidMessage);
                expect(verifyMessage(req, [slackMessageFormatter, hipChatMessageFormatter])).to.be.an("undefined");
            });


            it("generateSearchRequest() should return a valid request", function () {
                var generateRequest = app.__get__("generateSearchRequest");

                var generatedRequest = generateRequest("Rest");

                expect(generatedRequest).not.to.equal(null);
                expect(generatedRequest.includes("searchPhrase=Rest")).to.equal(true);
            });

            it("generateGetTotalOrdersRequest() should return a valid request", function () {
                var generateGetTotalOrdersRequest = app.__get__("generateGetTotalOrdersRequest");

                var generatedRequest = generateGetTotalOrdersRequest();

                expect(generatedRequest).not.to.equal(null);
                expect(generatedRequest.includes("deliveryMethod=Delivery")).to.equal(true);
            });

            it("filterByRestaurantName() should filter restaurants with the same name", function () {
                var filterByRestaurantName = app.__get__("filterByRestaurantName");

                let restaurant1 : Commons.Restaurant = new Commons.RestaurantBuilder().setRestaurantName("Rest1").setRestaurantId(1).build();
                let restaurant2 : Commons.Restaurant  = new Commons.RestaurantBuilder().setRestaurantName("Rest2").setRestaurantId(2).build();
                let restaurant3 : Commons.Restaurant  = new Commons.RestaurantBuilder().setRestaurantName("Rest1").setRestaurantId(3).build();

                var result = filterByRestaurantName([restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(null);
                expect(result.length).to.equal(2);
                expect(result.some(function(element : Commons.Restaurant) {
                    return element.RestaurantName === restaurant1.RestaurantName;
                 })).to.equal(true);
                expect(result.some(function(element : Commons.Restaurant) {
                    return element.RestaurantName === restaurant2.RestaurantName;;
                 })).to.equal(true);
            });

               it("filterByRestaurantName() should be ok with an empty array", function () {
                var filterByRestaurantName = app.__get__("filterByRestaurantName");

                var result = filterByRestaurantName([]);

                expect(result).not.to.equal(null);
                expect(result.length).to.equal(0);
            });

            it("filterByRestaurantName() should filter restaurants with the same name", function () {
                var filterByRestaurantName = app.__get__("filterByRestaurantName");

                let restaurant1 : Commons.Restaurant = new Commons.RestaurantBuilder().setRestaurantName("Rest1").setRestaurantId(1).build();
                let restaurant2 : Commons.Restaurant  = new Commons.RestaurantBuilder().setRestaurantName("Rest2").setRestaurantId(2).build();
                let restaurant3 : Commons.Restaurant  = new Commons.RestaurantBuilder().setRestaurantName("Rest1").setRestaurantId(3).build();


                var result = filterByRestaurantName([restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(null);
                expect(result.length).to.equal(2);
                expect(result.some(function(element : Commons.Restaurant) {
                    return element.RestaurantName === restaurant1.RestaurantName;
                })).to.equal(true);
                expect(result.some(function(element : Commons.Restaurant) {
                    return element.RestaurantName === restaurant2.RestaurantName;
                })).to.equal(true);
            });

            it("sortRestaurantsByDistance() should sort restaurants by distance", function () {
                var sortRestaurantsByDistance = app.__get__("sortRestaurantsByDistance");

                var restaurant1 = new Commons.RestaurantBuilder()
                .setRestaurantName("Rest1")
                .setRestaurantId(1)
                .setDistanceFromUserInMeters(10)
                .build();

                var restaurant2 = new Commons.RestaurantBuilder()
                .setRestaurantName("Rest2")
                .setRestaurantId(2)
                .setDistanceFromUserInMeters(20)
                .build();

                var restaurant3 = new Commons.RestaurantBuilder()
                .setRestaurantName("Rest3")
                .setRestaurantId(1)
                .setDistanceFromUserInMeters(15)
                .build();

                var result = sortRestaurantsByDistance([restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(null);
                expect(result.length).to.equal(3);
                expect(result[0].RestaurantName).to.be.equal(restaurant1.RestaurantName);
                expect(result[1].RestaurantName).to.be.equal(restaurant3.RestaurantName);
                expect(result[2].RestaurantName).to.be.equal(restaurant2.RestaurantName);
            });

            it("sortRestaurantsByDistance() should do nothing when fields are equal", function () {
                var sortRestaurantsByDistance = app.__get__("sortRestaurantsByDistance");

                var restaurant1 = new Commons.RestaurantBuilder()
                .setRestaurantName("Rest1")
                .setRestaurantId(1)
                .setDistanceFromUserInMeters(15)
                .build();

                var restaurant2 = new Commons.RestaurantBuilder()
                .setRestaurantName("Rest2")
                .setRestaurantId(2)
                .setDistanceFromUserInMeters(7)
                .build();

                var restaurant3 = new Commons.RestaurantBuilder()
                .setRestaurantName("Rest3")
                .setRestaurantId(3)
                .setDistanceFromUserInMeters(7)
                .build();

                var result = sortRestaurantsByDistance([restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(null);
                expect(result.length).to.equal(3);
                expect(result[0].RestaurantName).to.be.equal(restaurant2.RestaurantName);
                expect(result[1].RestaurantName).to.be.equal(restaurant3.RestaurantName);
                expect(result[2].RestaurantName).to.be.equal(restaurant1.RestaurantName);
            });

            it("sortRestaurantsByDistance() should do nothing when no field", function () {
                var sortRestaurantsByDistance = app.__get__("sortRestaurantsByDistance");

                let restaurant1 : Commons.Restaurant = new Commons.RestaurantBuilder().setRestaurantName("Rest1").setRestaurantId(1).build();
                let restaurant2 : Commons.Restaurant  = new Commons.RestaurantBuilder().setRestaurantName("Rest2").setRestaurantId(2).build();
                let restaurant3 : Commons.Restaurant  = new Commons.RestaurantBuilder().setRestaurantName("Rest3").setRestaurantId(3).build();


                var result = sortRestaurantsByDistance([restaurant1, restaurant2, restaurant3]);

                expect(result).not.to.equal(null);
                expect(result.length).to.equal(3);
                expect(result[0].RestaurantName).to.be.equal(restaurant1.RestaurantName);
                expect(result[1].RestaurantName).to.be.equal(restaurant2.RestaurantName);
                expect(result[2].RestaurantName).to.be.equal(restaurant3.RestaurantName);
            });

            it("filterTotalOrders() should filter the restaurants correctly", function () {
                var filterTotalOrders = app.__get__("filterTotalOrders");

                var filteredRestaurants = restaurants.filter(filterTotalOrders);

                expect(filteredRestaurants).not.to.equal(null);
                expect(filteredRestaurants.length).to.equal(1);
                filteredRestaurants.forEach(function(restaurant : Commons.Restaurant) {
                    expect(restaurant.PoolSumNumber > 0).to.be.equal(true);
                    expect(restaurant.IsOverPoolMin).to.be.equal(true);
                });
            });

});