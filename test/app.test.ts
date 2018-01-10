import { App } from "./../src/app";
import { Commons } from "../src/commons";
import { HipChatModule } from "../src/hipChatModule";
import { SlackModule } from "../src/slackModule";
import { SlackMessageFormatter } from "../src/slackMessage";
import { HipChatMessageFormatter } from "../src/hipChatMessage";
import "mocha";
import { expect } from "chai";
import { restaurants } from "./testCommons";

var rewire = require("rewire");
var slackMessageFormatter = SlackMessageFormatter.getInstance();
var hipChatMessageFormatter = HipChatMessageFormatter.getInstance();

describe("App", function () {
    it("verifyMessage() should return null if no items are passed in", function () {
        let app : App = new App();

    });
});