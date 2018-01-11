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
      winston.debug("Booting %s", Constants.APP_NAME);
    }

    process (req: Commons.Request, res: Commons.Response) : Commons.Response {
        const hipChatMessageFormatter = HipChatMessageFormatter.getInstance();
        const slackMessageFormatter = SlackMessageFormatter.getInstance();

        var messageFormatter = Commons.verifyMessage(req, [hipChatMessageFormatter, slackMessageFormatter]);
        if (!messageFormatter) {
            res.status(400);
            res.send(Constants.INVALID_MESSAGE_STRING);
            return res;
        }


        let restaurantName = messageFormatter.getRestaurantName(req);

        if (!restaurantName) {
            const body = messageFormatter.getErrorMessage(null);
            res.send(body);
            return res;
        }

        restaurantName = restaurantName.trim();

        if (restaurantName.toLowerCase() === Constants.TOTAL_KEYWORD.toLowerCase()) {
            this.getTotalOrders(res, messageFormatter);
        } else {
            this.search(res, messageFormatter, restaurantName);
        }
        return res;
    }

    search (res : Commons.Response, messageFormatter : Commons.MessageFormatter, restaurantName : string) : void {
        if (restaurantName.length === 0) { // Behavior for empty command ("/10bis" with no content)
            var body = messageFormatter.getDefaultResponse();
            res.send(body);
            return;
        }

        var parsed_url = Commons.generateSearchRequest(restaurantName);

        request.get(parsed_url, function(error : Error, response : Commons.Response, body : string) {
            if (!error && response.statusCode === 200) {
                var data = JSON.parse(body);

                if (!data || !data.length || data.length < 1) {
                    const badResBody = messageFormatter.getErrorMessage(restaurantName);
                    res.send(badResBody);
                    return;
                }

                const resBody = messageFormatter.generateSearchResponse(Commons.filterByRestaurantName(Commons.sortRestaurantsByDistance(data)));
                res.send(resBody);
            } else {
                res.status(400);
                res.send(Constants.ERROR_STRING);
            }
        });
    }

    getTotalOrders (res : Commons.Response, messageFormatter : Commons.MessageFormatter) : void {
            var parsed_url = Commons.generateGetTotalOrdersRequest();
            winston.debug("Total Orders Url: " + parsed_url);

            request.get(parsed_url, function(error : Error, response : Commons.Response, body : string) {
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
                    res.send(Constants.ERROR_STRING);
                }
            });
    }
}
export default new App();