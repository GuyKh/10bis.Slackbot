import { Commons } from "./src/commons";

var express = require("express");
var app = express();
var botApp = require("./src/app.js");
var debug = require("debug")("10bis.slackbot");
var appName = "10bis.slackbot";
var winston = require("winston");
const logLevel : string = process.env.LOG_LEVEL;
winston.level = logLevel;

debug("booting %s", appName);
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port : string = process.env.PORT;
app.set("port", (port || 9001));

app.get("/", function(req : Commons.Request, res : Commons.Response) {
    res.send("Sanity passed!");
});

app.post("/post", function(req : Commons.Request, res : Commons.Response) {
    botApp.process(req, res);
});

app.listen(app.get("port"), function() {
    //console.log("Node app is running on port", app.get("port"));
});