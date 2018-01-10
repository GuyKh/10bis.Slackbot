import * as bodyParser from "body-parser";
import * as express from "express";
import * as request from "request";
import * as winston from "winston";
import { Commons } from "./commons";
import { Constants } from "./constants";
import { HipChatMessageFormatter } from "./hipChatMessage";
import { SlackMessageFormatter } from "./slackMessage";

winston.level = process.env.LOG_LEVEL;

export class App {
    public express;

    constructor () {
      this.express = express();
      this.mountRoutes();

      this.express.use(bodyParser.json());
      this.express.use(bodyParser.urlencoded({ extended: true }));

      winston.debug("Booting %s", Constants.APP_NAME);
    }

    private mountRoutes (): void {
        const router = express.Router();

        router.get("/", function(req : Commons.Request, res : Commons.Response) {
            res.send("Sanity passed!");
        });

        router.post("/post", function(req : Commons.Request, res : Commons.Response) {
            this.process(req, res);
        });

        this.express.use("/", router);
        this.express.use("/post", router);
    }

    process (req: Commons.Request, res: Commons.Response) {
        const hipChatMessageFormatter = HipChatMessageFormatter.getInstance();
        const slackMessageFormatter = SlackMessageFormatter.getInstance();

        var messageFormatter = Commons.verifyMessage(req, [hipChatMessageFormatter, slackMessageFormatter]);
        if (!messageFormatter) {
            res.status(400);
            res.send("Invalid Message");
            return;
        }


        let restaurantName = messageFormatter.getRestaurantName(req);

        if (!restaurantName) {
            const body = messageFormatter.getErrorMessage(null);
            res.send(body);
            return;
        }

        restaurantName = restaurantName.trim();

        if (restaurantName.toLowerCase() === Constants.TOTAL_KEYWORD.toLowerCase()) {
            this.getTotalOrders(res, messageFormatter);
        } else {
            this.search(res, messageFormatter, restaurantName);
        }
    }

    search (res : Commons.Response, messageFormatter : Commons.MessageFormatter, restaurantName : string) : void {
        if (restaurantName.length === 0) { // Behavior for empty command ("/10bis" with no content)
            var body = messageFormatter.getDefaultResponse();
            res.send(body);
            return;
        }

        var parsed_url = Commons.generateSearchRequest(restaurantName);

        request(parsed_url, function(error : Error, response : Commons.Response, body : string) {
            if (!error && response.statusCode === 200) {
                var data = JSON.parse(body);

                if (!data || !data.length || data.length < 1) {
                    const badResBody = messageFormatter.getErrorMessage(restaurantName);
                    res.send(badResBody);
                    return;
                }

                const resBody = messageFormatter.generateSearchResponse(this.filterByRestaurantName(Commons.sortRestaurantsByDistance(data)));
                res.send(resBody);
            } else {
                res.status(400);
                res.send("None shall pass");
            }
        });
    }

    getTotalOrders (res : Commons.Response, messageFormatter : Commons.MessageFormatter) : void {
            var parsed_url = Commons.generateGetTotalOrdersRequest();
            winston.debug("Total Orders Url: " + parsed_url);

            request(parsed_url, function(error : Error, response : Commons.Response, body : string) {
                if (!error && response.statusCode === 200) {
                    var data = JSON.parse(body);

                    if (!data || !data.length || data.length < 1) {
                        const resBody = messageFormatter.getErrorMessage(null);
                        res.send(resBody);
                        return;
                    }

                    var restaurants = data.filter(Commons.filterTotalOrders);

                    const resBody = messageFormatter.generateTotalOrdersResponse(this.filterByRestaurantName(restaurants));
                    res.send(resBody);
                } else {
                    res.status(400);
                    res.send("None shall pass");
                }
            });
    }
  }

export default new App().express;