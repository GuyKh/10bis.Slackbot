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

let get : any;
let post : any;

describe("App", function () {
    beforeEach(function() {
		this.get = sinon.stub(request, "get");
		this.post = sinon.stub(request, "post");
    });

    afterEach(function() {
        (this.get as sinon.SinonStub).restore();
        (this.post as sinon.SinonStub).restore();
	});

    it("process() should return one restaurant if valid Slack message", function () {
        let res : Commons.Response = {
            statusCode: 200,
            status: function(num : number) {
                expect(num).to.equal(200);
            },
            send: function(body: Commons.TenBisResponse) {
                expect(body).not.to.equal(null);
                expect(body).to.be.an.instanceof(SlackModule.SlackResponse);

                let slackRes : SlackModule.SlackResponse = body as SlackModule.SlackResponse;

                expect(slackRes.text).to.equal("Found 1 restaurants");
                expect(slackRes.response_type).to.equal("in_channel");
                expect(slackRes.attachments).not.to.equal(null);
                expect(slackRes.attachments.length).to.equal(1);
                expect(slackRes.attachments[0].title).to.equal(validSlackMessage.text);
            }
        };
        app.process(slackReq, res);
    });
    it("process() should return one restaurant if valid HipChat message", function () {
        let res : Commons.Response = {
            statusCode: 200,
            status: function(num : number) {
                expect(num).to.equal(200);
            },
            send: function(body: Commons.TenBisResponse) {
                expect(body).not.to.equal(null);
                expect(body).to.be.an.instanceof(HipChatModule.HipChatResponse);

                let hipChatRes : HipChatModule.HipChatResponse = body as HipChatModule.HipChatResponse;

                expect(hipChatRes.message.replace(/^\s+|\s+$/g, "")).to.equal("Found 1 restaurants");
                expect(hipChatRes.message_format).to.equal("text");
                expect(hipChatRes.card).not.to.equal(null);

                let message = validHipChatMessage.item.message.message;
                if (message.indexOf(HipChatMessageFormatter.COMMAND_OPERATOR) === 0) {
                    message = message.slice(HipChatMessageFormatter.COMMAND_OPERATOR.length + 1);
                }
                expect(hipChatRes.card.title).to.equal(message);
            }
        };
        app.process(hipChatReq, res);
    });
    it("process() should return default message if invalid Slack message", function () {
        let res : Commons.Response = {
            statusCode: 200,
            status: function(num : number) {
                expect(num).to.equal(400);
            },
            send: function(body: Commons.TenBisResponse) {
                expect(body).not.to.equal(null);
                expect(body).not.to.be.an.instanceof(SlackModule.SlackResponse);
                expect(body).to.equal(Constants.INVALID_MESSAGE_STRING);
            }
        };
        app.process(badSlackReq, res);
    });
    it("process() should return default if invalid HipChat message", function () {
        let res : Commons.Response = {
            statusCode: 200,
            status: function(num : number) {
                expect(num).to.equal(400);
            },
            send: function(body: Commons.TenBisResponse) {
                expect(body).not.to.equal(null);
                expect(body).not.to.be.an.instanceof(HipChatModule.HipChatResponse);
                expect(body).to.equal(Constants.INVALID_MESSAGE_STRING);
            }
        };
        app.process(badHipChatReq, res);
    });
    it("process() should return default if invalid message", function () {
        let res : Commons.Response = {
            statusCode: 200,
            status: function(num : number) {
                expect(num).to.equal(400);
            },
            send: function(body: Commons.TenBisResponse) {
                expect(body).not.to.equal(null);
                expect(body).to.equal(Constants.INVALID_MESSAGE_STRING);
            }
        };
        app.process(new EmptyRequest(), res);
    });
    it("process() should return no restaurants if valid Slack message returns nothing", function () {
        let slackEmptyReq : SlackModule.SlackRequest = deepCopy(slackReq);
        slackEmptyReq.body.text = "BlaBlaBla";

        let res : Commons.Response = {
            statusCode: 200,
            status: function(num : number) {
                expect(num).to.equal(200);
            },
            send: function(body: Commons.TenBisResponse) {
                expect(body).not.to.equal(null);
                expect(body).to.be.an.instanceof(SlackModule.SlackResponse);

                let slackRes : SlackModule.SlackResponse = body as SlackModule.SlackResponse;

                expect(slackRes.text).to.equal(Constants.NO_RESTAURANTS_FOUND_STRING + " for: " + badRestaurantName);
                expect(slackRes.response_type).to.equal("ephemeral");
                expect(slackRes.attachments).to.equal(null);
            }
        };
        app.process(slackEmptyReq, res);
    });
    it("process() should return no restaurants if valid HipChat message returns nothing", function () {
        let hipChatEmptyReq : HipChatModule.HipChatReq = deepCopy(hipChatReq);
        hipChatEmptyReq.body.item.message.message = HipChatMessageFormatter.COMMAND_OPERATOR + " " + badRestaurantName;

        let res : Commons.Response = {
            statusCode: 200,
            status: function(num : number) {
                expect(num).to.equal(200);
            },
            send: function(body: Commons.TenBisResponse) {
                expect(body).not.to.equal(null);
                expect(body).to.be.an.instanceof(HipChatModule.HipChatResponse);

                let hipChatRes : HipChatModule.HipChatResponse = body as HipChatModule.HipChatResponse;

                expect(hipChatRes.message.replace(/^\s+|\s+$/g, "")).to.equal(Constants.NO_RESTAURANTS_FOUND_STRING + " for: " + badRestaurantName);
                expect(hipChatRes.message_format).to.equal("text");
                expect(hipChatRes.card).not.to.equal(null);

                let message = validHipChatMessage.item.message.message;
                if (message.indexOf(HipChatMessageFormatter.COMMAND_OPERATOR) === 0) {
                    message = message.slice(HipChatMessageFormatter.COMMAND_OPERATOR.length + 1);
                }
            }
        };
        app.process(hipChatEmptyReq, res);
    });
    it("process() should return valid response if command is total", function () {
        let slackTotalReq : SlackModule.SlackRequest = deepCopy(slackReq);
        slackTotalReq.body.text = Constants.TOTAL_KEYWORD;

        let res : Commons.Response = {
            statusCode: 200,
            status: function(num : number) {
                expect(num).to.equal(200);
            },
            send: function(body: Commons.TenBisResponse) {
                expect(body).not.to.equal(null);
                expect(body).to.be.an.instanceof(SlackModule.SlackResponse);

                let slackRes : SlackModule.SlackResponse = body as SlackModule.SlackResponse;
                expect(slackRes.response_type).to.equal("ephemeral");
            }
        };
        app.process(slackTotalReq, res);
    });
    it("process() should return no restaurants if valid HipChat message returns nothing", function () {
        let hipChatTotalReq : HipChatModule.HipChatReq = deepCopy(hipChatReq);
        hipChatTotalReq.body.item.message.message = HipChatMessageFormatter.COMMAND_OPERATOR + " " + Constants.TOTAL_KEYWORD;

        let res : Commons.Response = {
            statusCode: 200,
            status: function(num : number) {
                expect(num).to.equal(200);
            },
            send: function(body: Commons.TenBisResponse) {
                expect(body).not.to.equal(null);
                expect(body).to.be.an.instanceof(HipChatModule.HipChatResponse);

                let hipChatRes : HipChatModule.HipChatResponse = body as HipChatModule.HipChatResponse;

                expect(hipChatRes.message_format).to.equal("text");
            }
        };
        app.process(hipChatTotalReq, res);
    });
    it("getTotalOrders() should return valid response if command is total", function () {
        let res : Commons.Response = {
            statusCode: 200,
            status: function(num : number) {
                expect(num).to.equal(200);
            },
            send: function(body: Commons.TenBisResponse) {
                expect(body).not.to.equal(null);
                expect(body).to.be.an.instanceof(SlackModule.SlackResponse);

                let slackRes : SlackModule.SlackResponse = body as SlackModule.SlackResponse;
                expect(slackRes.response_type).to.equal("ephemeral");
            }
        };
        app.getTotalOrders(res, SlackMessageFormatter.getInstance());
    });
    it("getTotalOrders() should return valid response if command is total", function () {
        let res : Commons.Response = {
            statusCode: 200,
            status: function(num : number) {
                expect(num).to.equal(200);
            },
            send: function(body: Commons.TenBisResponse) {
                expect(body).not.to.equal(null);
                expect(body).to.be.an.instanceof(HipChatModule.HipChatResponse);

                let hipChatRes : HipChatModule.HipChatResponse = body as HipChatModule.HipChatResponse;

                expect(hipChatRes.message_format).to.equal("text");
            }
        };
        app.getTotalOrders(res, HipChatMessageFormatter.getInstance());
    });
    it("process() with error", function () {
        let res : Commons.Response = {
            statusCode: 200,
            status: function(num : number) {
                expect(num).to.equal(400);
            },
            send: function(body: Commons.TenBisResponse) {
                expect(body).not.to.equal(null);
                expect(body).not.to.be.an.instanceof(SlackModule.SlackResponse);
                expect(body).to.be.equal(Constants.ERROR_STRING);
            }
        };
        this.get.yields("error", null , null);
        app.process(slackReq, res);
    });
    it("search() with error", function () {
        let res : Commons.Response = {
            statusCode: 200,
            status: function(num : number) {
                expect(num).to.equal(400);
            },
            send: function(body: Commons.TenBisResponse) {
                expect(body).not.to.equal(null);
                expect(body).not.to.be.an.instanceof(HipChatModule.HipChatResponse);
                expect(body).to.be.equal(Constants.ERROR_STRING);
            }
        };
        this.get.yields("error", null , null);
        app.search(res, SlackMessageFormatter.getInstance(), badRestaurantName);
    });
    it("getTotalOrders() with error", function () {
        let res : Commons.Response = {
            statusCode: 200,
            status: function(num : number) {
                expect(num).to.equal(400);
            },
            send: function(body: Commons.TenBisResponse) {
                expect(body).not.to.equal(null);
                expect(body).not.to.be.an.instanceof(HipChatModule.HipChatResponse);
                expect(body).to.be.equal(Constants.ERROR_STRING);
            }
        };
        this.get.yields("error", null , null);
        app.getTotalOrders(res, SlackMessageFormatter.getInstance());
    });
});