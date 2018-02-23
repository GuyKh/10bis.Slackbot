import { App } from "./../src/app";
import { Commons } from "../src/commons";
import { HipChatModule } from "../src/hipChatModule";
import { SlackModule } from "../src/slackModule";
import { SlackMessageFormatter } from "../src/slackMessage";
import { HipChatMessageFormatter } from "../src/hipChatMessage";
import "mocha";
import { expect } from "chai";
import { restaurants, validSlackMessage, validHipChatMessage, slackInvalidMessage, hipChatInvalidMessage, deepCopy } from "./testCommons";
import { Constants } from "../src/constants";
import * as sinon from "sinon";
import * as request from "request";
import { SinonStub } from "sinon";
import { Request, Response, NextFunction } from "express";


let MockExpressResponse = require("mock-express-response");
let slackMessageFormatter : SlackMessageFormatter = SlackMessageFormatter.getInstance();
let hipChatMessageFormatter : HipChatMessageFormatter = HipChatMessageFormatter.getInstance();
let app : App = new App();
let slackReq : Commons.Request = new SlackModule.SlackRequest(validSlackMessage);
let badSlackReq : Commons.Request = new SlackModule.SlackRequest(slackInvalidMessage);
let hipChatReq : Commons.Request = new HipChatModule.HipChatReq(validHipChatMessage);
let badHipChatReq : Commons.Request = new HipChatModule.HipChatReq(hipChatInvalidMessage);
let badRestaurantName : string = "BlaBlaBla";

class EmptyRequest implements Commons.Request {
    body: any;
}
let get : SinonStub;

class StaticMethodHolder {
    public static RequestGet;
}

// tslint:disable:no-unused-expression
describe("App", () => {
    it("process() should return one restaurant if valid Slack message", () => {
        let res = new MockExpressResponse();
        return app.process(slackReq, res).then( (result) => {
            expect(res.statusCode).to.equal(200);

            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let slackRes : SlackModule.SlackResponse = body;

            expect(slackRes).not.to.equal(null);
            expect(slackRes).not.to.be.undefined;
            expect(slackRes.text).to.equal("Found 1 restaurants");
            expect(slackRes.response_type).to.equal("in_channel");
            expect(slackRes.attachments).not.to.equal(null);
            expect(slackRes.attachments.length).to.equal(1);
            expect(slackRes.attachments[0].title).to.equal(validSlackMessage.text);
         }
        );
    });
    it("process() should return one restaurant if valid Slack message withoud quotes", () => {
        let res = new MockExpressResponse();
        let req : SlackModule.SlackRequest = deepCopy(slackReq);
        req.body.text = "ליב";

        return app.process(req, res).then( (result) => {
            expect(res.statusCode).to.equal(200);

            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let slackRes : SlackModule.SlackResponse = body;

            expect(slackRes).not.to.equal(null);
            expect(slackRes).not.to.be.undefined;
            expect(slackRes.text).not.to.equal("Found 1 restaurants"); // More than one
            expect(slackRes.response_type).to.equal("in_channel");
         }
        );
    });
    it("process() should return one restaurant if valid Slack message with quotes (\") ", () => {
        let res = new MockExpressResponse();
        let req : SlackModule.SlackRequest = deepCopy(slackReq);
        req.body.text = "\"ליב\""; // "ליב"

        return app.process(req, res).then( (result) => {
            expect(res.statusCode).to.equal(200);

            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let slackRes : SlackModule.SlackResponse = body;

            expect(slackRes).not.to.equal(null);
            expect(slackRes).not.to.be.undefined;
            expect(slackRes.text).to.equal("Found 1 restaurants"); // Exactly one
            expect(slackRes.response_type).to.equal("in_channel");
            expect(slackRes.attachments.length).to.equal(1);
         }
        );
    });
    it("process() should return one restaurant if valid Slack message with quotes (\') ", () => {
        let res = new MockExpressResponse();
        let req : SlackModule.SlackRequest = deepCopy(slackReq);
        req.body.text = "\'ליב\'"; // "ליב"

        return app.process(req, res).then( (result) => {
            expect(res.statusCode).to.equal(200);

            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let slackRes : SlackModule.SlackResponse = body;

            expect(slackRes).not.to.equal(null);
            expect(slackRes).not.to.be.undefined;
            expect(slackRes.text).to.equal("Found 1 restaurants"); // Exactly one
            expect(slackRes.response_type).to.equal("in_channel");
            expect(slackRes.attachments.length).to.equal(1);
         }
        );
    });
    it("process() should return one restaurant if valid Slack message with quotes (\״) ", () => {
        let res = new MockExpressResponse();
        let req : SlackModule.SlackRequest = deepCopy(slackReq);
        req.body.text = "\״ליב\״"; // "ליב"

        return app.process(req, res).then( (result) => {
            expect(res.statusCode).to.equal(200);

            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let slackRes : SlackModule.SlackResponse = body;

            expect(slackRes).not.to.equal(null);
            expect(slackRes).not.to.be.undefined;
            expect(slackRes.text).to.equal("Found 1 restaurants"); // Exactly one
            expect(slackRes.response_type).to.equal("in_channel");
            expect(slackRes.attachments.length).to.equal(1);
         }
        );
    });
    it("process() should return one restaurant if valid HipChat message", () => {
        let res = new MockExpressResponse();
        return app.process(hipChatReq, res).then( (result) => {
            expect(res.statusCode).to.equal(200);

            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let hipChatRes : HipChatModule.HipChatResponse = body;
            expect(hipChatRes).not.to.equal(null);
            expect(hipChatRes).not.to.be.undefined;

            expect(hipChatRes.message.replace(/^\s+|\s+$/g, "")).to.equal("Found 1 restaurants");
            expect(hipChatRes.message_format).to.equal("text");
            expect(hipChatRes.card).not.to.equal(null);

            let message = validHipChatMessage.item.message.message;
            if (message.indexOf(HipChatMessageFormatter.COMMAND_OPERATOR) === 0) {
                message = message.slice(HipChatMessageFormatter.COMMAND_OPERATOR.length + 1);
            }
            expect(hipChatRes.card.title).to.equal(message);
         }
        );
    });
    it("process() should return default message if invalid Slack message", () => {
        let res = new MockExpressResponse();

        return app.process(badSlackReq, res).catch( (result) => {
            expect(res.statusCode).to.equal(400);

            let body = res._getString();
            expect(body).not.to.equal(null);
            expect(body).not.to.be.an.instanceof(SlackModule.SlackResponse);
            expect(body).to.equal(Constants.INVALID_MESSAGE_STRING);
        });
    });
    it("process() should return default if invalid HipChat message", () => {

        let res = new MockExpressResponse();

        app.process(badHipChatReq, res).catch((result) => {
            expect(res.statusCode).to.equal(400);

            let body = res._getString();
            expect(body).not.to.equal(null);
            expect(body).not.to.be.an.instanceof(HipChatModule.HipChatResponse);
            expect(body).to.equal(Constants.INVALID_MESSAGE_STRING);
        });
    });
    it("process() should return default if invalid message", () => {

        let res = new MockExpressResponse();

        app.process(new EmptyRequest(), res).catch( (result) => {

            expect(res.statusCode).to.equal(400);

            let body = res._getString();

            expect(body).not.to.equal(null);
            expect(body).to.equal(Constants.INVALID_MESSAGE_STRING);
        });
    });
    it("process() should return no restaurants if valid Slack message returns nothing", () => {
        let slackEmptyReq : SlackModule.SlackRequest = deepCopy(slackReq);
        slackEmptyReq.body.text = badRestaurantName;

        let res = new MockExpressResponse();
        return app.process(slackEmptyReq, res).then ((result) => {

            expect(res.statusCode).to.be.equal(200);
            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let slackRes : SlackModule.SlackResponse = body;

            expect(slackRes).not.to.equal(null);
            expect(slackRes).not.to.be.undefined;

            expect(slackRes.text).to.equal(Constants.NO_RESTAURANTS_FOUND_STRING + " for: " + badRestaurantName);
            expect(slackRes.response_type).to.equal("ephemeral");
            expect(slackRes.attachments).to.equal(null);
        });
    });
    it("process() should return no restaurants if valid HipChat message returns nothing", () => {
        let hipChatEmptyReq : HipChatModule.HipChatReq = deepCopy(hipChatReq);
        hipChatEmptyReq.body.item.message.message = HipChatMessageFormatter.COMMAND_OPERATOR + " " + badRestaurantName;
        let res = new MockExpressResponse();

        return app.process(hipChatEmptyReq, res).then((result) => {
            expect(res.statusCode).to.be.equal(200);
            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let hipChatRes : HipChatModule.HipChatResponse = body;
            expect(hipChatRes).not.to.equal(null);
            expect(hipChatRes).not.to.be.undefined;

            expect(hipChatRes.message.replace(/^\s+|\s+$/g, "")).to.equal(Constants.NO_RESTAURANTS_FOUND_STRING + " for: " + badRestaurantName);
            expect(hipChatRes.message_format).to.equal("text");
            expect(hipChatRes.card).not.to.equal(null);

            let message = validHipChatMessage.item.message.message;
            if (message.indexOf(HipChatMessageFormatter.COMMAND_OPERATOR) === 0) {
                message = message.slice(HipChatMessageFormatter.COMMAND_OPERATOR.length + 1);
            }
        });
    });
    it("process() should return valid response if command is total", () => {
        let slackTotalReq : SlackModule.SlackRequest = deepCopy(slackReq);
        slackTotalReq.body.text = Constants.TOTAL_KEYWORD;

        let res = new MockExpressResponse();

        app.process(slackTotalReq, res).then((result) => {
            expect(res.statusCode).to.be.equal(200);
            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let slackRes : SlackModule.SlackResponse = body;

            expect(slackRes).not.to.equal(null);
            expect(slackRes).not.to.be.undefined;
            expect(slackRes.response_type).to.equal("in_channel");
        });
    });
    it("process() should return error if using empty restaurant name for slack", () => {
        let slackTotalReq : SlackModule.SlackRequest = deepCopy(slackReq);
        slackTotalReq.body.text = "";

        let res = new MockExpressResponse();

        app.process(slackTotalReq, res).catch((result) => {
            expect(res.statusCode).to.be.equal(400);
            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let slackRes : SlackModule.SlackResponse = body;

            expect(slackRes).not.to.equal(null);
            expect(slackRes).not.to.be.undefined;
            expect(slackRes.response_type).to.equal("ephemeral");
            expect(slackRes.text).to.equal(Constants.NO_RESTAURANTS_FOUND_STRING);
        });
    });
    it("process() should return error if using empty restaurant name for hipchat", () => {
        let hipChatRequest : HipChatModule.HipChatReq = deepCopy(hipChatReq);
        hipChatRequest.body.item.message.message = "/10bis ";

        let res = new MockExpressResponse();

        app.process(hipChatRequest, res).catch((result) => {
            expect(res.statusCode).to.be.equal(400);
            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let hipChatResponse : HipChatModule.HipChatResponse = body;

            expect(hipChatResponse).not.to.equal(null);
            expect(hipChatResponse.message_format).to.equal("text");
            expect(hipChatResponse.message).to.equal(Constants.NO_RESTAURANTS_FOUND_STRING);
        });
    });
    it("process() should return no restaurants if valid HipChat message returns nothing", () => {
        let hipChatTotalReq : HipChatModule.HipChatReq = deepCopy(hipChatReq);
        hipChatTotalReq.body.item.message.message = HipChatMessageFormatter.COMMAND_OPERATOR + " " + Constants.TOTAL_KEYWORD;
        let res = new MockExpressResponse();

        return app.process(hipChatTotalReq, res).then((result) => {
            expect(res.statusCode).to.be.equal(200);
            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let hipChatRes : HipChatModule.HipChatResponse = body;
            expect(hipChatRes).not.to.equal(null);
            expect(hipChatRes).not.to.be.undefined;
            expect(hipChatRes.message_format).to.equal("text");
        });
    });
    it("getTotalOrders() should return valid response if command is total (slack)", () => {
        let date : Date = new Date();
        let current_hour : number = date.getHours();

        let res = new MockExpressResponse();

        return app.getTotalOrders(res, SlackMessageFormatter.getInstance()).then((result) => {
            expect(res.statusCode).to.be.equal(200);
            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let slackRes : SlackModule.SlackResponse = body;

            expect(slackRes).not.to.equal(null);
            expect(slackRes).not.to.be.undefined;
            expect(slackRes.response_type).to.equal("in_channel");
        });
    });
    it("getTotalOrders() should return valid response if command is total (HipChat)", () => {
        let res = new MockExpressResponse();

        return app.getTotalOrders(res, HipChatMessageFormatter.getInstance()).then((result) => {
            expect(res.statusCode).to.be.equal(200);
            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let hipChatRes : HipChatModule.HipChatResponse = body;
            expect(hipChatRes).not.to.equal(null);
            expect(hipChatRes).not.to.be.undefined;
            expect(hipChatRes.message_format).to.equal("text");
        });
    });
    it("search() with null restaurant name - Slack", () => {
        let res = new MockExpressResponse();

        return app.search(res, SlackMessageFormatter.getInstance(), null, false, false).catch((result) => {
            expect(res.statusCode).to.be.equal(400);
            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let slackRes : SlackModule.SlackResponse = body;

            expect(slackRes).not.to.equal(null);
            expect(slackRes).not.to.be.undefined;
            expect(slackRes.response_type).to.equal("ephemeral");
            expect(slackRes.text).to.equal(Constants.DEFAULT_RESPONSE);
        });
    });
    it("search() with null restaurant name - HipChat", () => {
        let res = new MockExpressResponse();

        return app.search(res, HipChatMessageFormatter.getInstance(), null, false, false).catch((result) => {
            expect(res.statusCode).to.be.equal(400);
            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let hipChatResponse : HipChatModule.HipChatResponse = body;

            expect(hipChatResponse).not.to.equal(null);
            expect(hipChatResponse.message_format).to.equal("text");
            expect(hipChatResponse.message).to.equal(Constants.DEFAULT_RESPONSE);
        });
    });
    it("search() with empty restaurant name - Slack", () => {
        let res = new MockExpressResponse();

        return app.search(res, SlackMessageFormatter.getInstance(), "", false, false).catch((result) => {
            expect(res.statusCode).to.be.equal(400);
            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let slackRes : SlackModule.SlackResponse = body;

            expect(slackRes).not.to.equal(null);
            expect(slackRes).not.to.be.undefined;
            expect(slackRes.response_type).to.equal("ephemeral");
            expect(slackRes.text).to.equal(Constants.DEFAULT_RESPONSE);
        });
    });
    it("search() with empty restaurant name - HipChat", () => {
        let res = new MockExpressResponse();

        return app.search(res, HipChatMessageFormatter.getInstance(), "", false, false).catch((result) => {
            expect(res.statusCode).to.be.equal(400);
            let body = res._getJSON();
            expect(body).not.to.equal(null);
            let hipChatResponse : HipChatModule.HipChatResponse = body;

            expect(hipChatResponse).not.to.equal(null);
            expect(hipChatResponse.message_format).to.equal("text");
            expect(hipChatResponse.message).to.equal(Constants.DEFAULT_RESPONSE);
        });
    });
    describe("Test Cache", () => {
        beforeEach(function() {
            StaticMethodHolder.RequestGet = sinon.spy(request, "get");
        });

        afterEach(function() {
            (StaticMethodHolder.RequestGet as sinon.SinonStub).restore();
        });

        it("process() should use cache instead of calling individual calls every time", () => {
            let res = new MockExpressResponse();

            let req : SlackModule.SlackRequest = deepCopy(slackReq);
            req.body.text = "ניני";

            let _this = this;
            let _get = this.get;
            return app.process(req, res).then( () => {
                expect(res.statusCode).to.equal(200);

                let body = res._getJSON();
                expect(body).not.to.equal(null);
                let slackRes : SlackModule.SlackResponse = body;
                expect(slackRes).not.to.equal(null);

                res = new MockExpressResponse();
                return app.process(req, res).then(() => {
                    expect(res.statusCode).to.equal(200);

                    let body = res._getJSON();
                    expect(body).not.to.equal(null);
                    let slackRes : SlackModule.SlackResponse = body;
                    expect(slackRes).not.to.equal(null);

                }).then(() => {
                    sinon.assert.calledOnce(StaticMethodHolder.RequestGet);
                });
            });
        });

        it("search() should use cache instead of calling individual calls every time", () => {
            let res = new MockExpressResponse();
            let restName : string = "שף סלט";
            return app.search(res, SlackMessageFormatter.getInstance(), restName, false, true).then(() => {
                expect(res.statusCode).to.be.equal(200);
                let body = res._getJSON();
                expect(body).not.to.equal(null);
                let slackRes : SlackModule.SlackResponse = body;
                expect(slackRes).not.to.equal(null);
                res = new MockExpressResponse();
                return app.search(res, SlackMessageFormatter.getInstance(), restName, false, true).then(() => {
                    expect(res.statusCode).to.equal(200);

                    let body = res._getJSON();
                    expect(body).not.to.equal(null);
                    let slackRes : SlackModule.SlackResponse = body;
                    expect(slackRes).not.to.equal(null);
                });
            }).then(() => {
                sinon.assert.calledOnce(StaticMethodHolder.RequestGet);
            });
        });
        it("search() should not use cache if flag is off", () => {
            let res = new MockExpressResponse();
            let restName : string = "שף סלט";
            return app.search(res, SlackMessageFormatter.getInstance(), restName, false, false).then(() => {
                expect(res.statusCode).to.be.equal(200);
                let body = res._getJSON();
                expect(body).not.to.equal(null);
                let slackRes : SlackModule.SlackResponse = body;
                expect(slackRes).not.to.equal(null);

                res = new MockExpressResponse();
                return app.search(res, SlackMessageFormatter.getInstance(), restName, false, false).then(() => {
                    expect(res.statusCode).to.equal(200);

                    let body = res._getJSON();
                    expect(body).not.to.equal(null);
                    let slackRes : SlackModule.SlackResponse = body;
                    expect(slackRes).not.to.equal(null);
                });
            }).then(() => {
                sinon.assert.calledTwice(StaticMethodHolder.RequestGet);
            });
        });
        it("search() should not cache restaurants which are not found", () => {
            let res = new MockExpressResponse();
            let restName : string = "מממ";
            return app.search(res, SlackMessageFormatter.getInstance(), restName, false, true).then(() => {
                expect(res.statusCode).to.be.equal(200);
                let body = res._getJSON();
                expect(body).not.to.equal(null);
                let slackRes : SlackModule.SlackResponse = body;
                expect(slackRes).not.to.equal(null);

                res = new MockExpressResponse();
                return app.search(res, SlackMessageFormatter.getInstance(), restName, false, true).then(() => {
                    expect(res.statusCode).to.equal(200);

                    let body = res._getJSON();
                    expect(body).not.to.equal(null);
                    let slackRes : SlackModule.SlackResponse = body;
                    expect(slackRes).not.to.equal(null);
                });
            }).then(() => {
                sinon.assert.calledTwice(StaticMethodHolder.RequestGet);
            });
        });
    });

    describe("ResponseCode from 10bis != 200", () => {
        beforeEach(function() {
            this.get = sinon.stub(request, "get");
            let res = new MockExpressResponse();
            res.statusCode = 201;

            this.get.yields(null, res , null);
        });

        afterEach(function() {
            (this.get as sinon.SinonStub).restore();
        });

        it("process() with other response than 200", () => {
            let res = new MockExpressResponse();

            let req : SlackModule.SlackRequest = deepCopy(slackReq);
            req.body.text = "ABCD";

            return app.process(req, res).then((result) => {
                throw new Error("I shouldn't be here");
            }).catch((result) => {
                expect(res.statusCode).to.be.equal(400);
                let body = res._getString();

                expect(body).not.to.equal(null);
                expect(body).not.to.be.an.instanceof(SlackModule.SlackResponse);
                expect(body).to.be.equal(Constants.ERROR_STRING);
            });
        });
        it("search() with response code = 201", () => {
            let res = new MockExpressResponse();

            return app.search(res, SlackMessageFormatter.getInstance(), badRestaurantName, false, false).then((result) => {
                throw new Error("I shouldn't be here");
            }).catch((result) => {
                expect(res.statusCode).to.be.equal(400);
                let body = res._getString();

                expect(body).not.to.equal(null);
                expect(body).not.to.be.an.instanceof(SlackModule.SlackResponse);
                expect(body).to.be.equal(Constants.ERROR_STRING);
            });
        });
        it("getTotalOrders() with error = 201", () => {
            let res = new MockExpressResponse();
            return app.getTotalOrders(res, SlackMessageFormatter.getInstance()).then((result) => {
                throw new Error("I shouldn't be here");
            }).catch((result) => {
                expect(res.statusCode).to.be.equal(400);
                let body = res._getString();

                expect(body).not.to.equal(null);
                expect(body).not.to.be.an.instanceof(SlackModule.SlackResponse);
                expect(body).to.be.equal(Constants.ERROR_STRING);
            });
        });
    });

    describe("ResponseCode from 10bis == 200 with empty response", () => {
        beforeEach(function() {
            this.get = sinon.stub(request, "get");
            let res = new MockExpressResponse();
            res.body = "";
            this.get.yields(null, res , null);
        });

        afterEach(function() {
            (this.get as sinon.SinonStub).restore();
        });

        it("process() with response == 200 with empty content", () => {
            let res = new MockExpressResponse();

            let restaurantName : string = "ABCDEF";
            let req : SlackModule.SlackRequest = deepCopy(slackReq);
            req.body.text = restaurantName;

            return app.process(req, res).then((result) => {
                throw new Error("I shouldn't be here");
            }).catch((result) => {
                expect(res.statusCode).to.be.equal(200);
                let body = res._getJSON();
                expect(body).not.to.equal(null);
                let slackRes : SlackModule.SlackResponse = body;

                expect(slackRes).not.to.equal(null);
                expect(slackRes).not.to.be.undefined;
                expect(slackRes.text).to.equal(Constants.NO_RESTAURANTS_FOUND_STRING + " for: " + restaurantName);
                expect(slackRes.response_type).to.equal("ephemeral");
                expect(slackRes.attachments).to.equal(null);
            });
        });
        it("search() with response == 200 with empty content", () => {
            let res = new MockExpressResponse();

            return app.search(res, SlackMessageFormatter.getInstance(), badRestaurantName, false, false).then((result) => {
                throw new Error("I shouldn't be here");
            }).catch((result) => {
                expect(res.statusCode).to.be.equal(200);
                let body = res._getJSON();
                expect(body).not.to.equal(null);
                let slackRes : SlackModule.SlackResponse = body;

                expect(slackRes).not.to.equal(null);
                expect(slackRes).not.to.be.undefined;
                expect(slackRes.text).to.equal(Constants.NO_RESTAURANTS_FOUND_STRING + " for: " + badRestaurantName);
                expect(slackRes.response_type).to.equal("ephemeral");
                expect(slackRes.attachments).to.equal(null);
            });
        });
        it("getTotalOrders() with response == 200 with empty content", () => {
            let res = new MockExpressResponse();
            return app.getTotalOrders(res, SlackMessageFormatter.getInstance()).then((result) => {
                throw new Error("I shouldn't be here");
            }).catch((result) => {

                expect(res.statusCode).to.be.equal(200);
                let body = res._getJSON();
                expect(body).not.to.equal(null);
                let slackRes : SlackModule.SlackResponse = body;

                expect(slackRes).not.to.equal(null);
                expect(slackRes).not.to.be.undefined;
                expect(slackRes.text).to.equal(Constants.NO_RESTAURANTS_FOUND_STRING);
                expect(slackRes.response_type).to.equal("ephemeral");
                expect(slackRes.attachments).to.equal(null);
            });
        });

    });

    describe("Response from 10bis is error (400)", () => {
        beforeEach(function() {
            this.get = sinon.stub(request, "get");
            this.get.yields("error", null , null);
        });

        afterEach(function() {
            (this.get as sinon.SinonStub).restore();
        });

        it("process() with error (400)", () => {
            let res = new MockExpressResponse();

            let req : SlackModule.SlackRequest = deepCopy(slackReq);
            req.body.text = "Aaaa";

            return app.process(req, res).then((result) => {
                throw new Error("I shouldn't be here");
            }).catch((result) => {
                expect(res.statusCode).to.be.equal(400);
                let body = res._getString();

                expect(body).not.to.equal(null);
                expect(body).not.to.be.an.instanceof(SlackModule.SlackResponse);
                expect(body).to.be.equal(Constants.ERROR_STRING);
            });
        });
        it("search() with error (400)", () => {
            let res = new MockExpressResponse();

            return app.search(res, SlackMessageFormatter.getInstance(), badRestaurantName, false, false).then((result) => {
                throw new Error("I shouldn't be here");
            }).catch((result) => {
                expect(res.statusCode).to.be.equal(400);
                let body = res._getString();

                expect(body).not.to.equal(null);
                expect(body).not.to.be.an.instanceof(HipChatModule.HipChatResponse);
                expect(body).to.be.equal(Constants.ERROR_STRING);
            });
        });
        it("getTotalOrders() with error (400)", () => {
            let res = new MockExpressResponse();

            return app.getTotalOrders(res, SlackMessageFormatter.getInstance()).then((result) => {
                throw new Error("I shouldn't be here");
            }).catch((result) => {
                expect(res.statusCode).to.be.equal(400);
                let body = res._getString();

                expect(body).not.to.equal(null);
                expect(body).not.to.be.an.instanceof(HipChatModule.HipChatResponse);
                expect(body).to.be.equal(Constants.ERROR_STRING);
            });
        });
    });
});
// tslint:enable:no-unused-expression