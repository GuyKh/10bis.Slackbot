import * as bodyParser from "body-parser";
import { Request, Response, NextFunction } from "express";
import * as winston from "winston";
import { Commons } from "./commons";
import { Constants } from "./constants";
import { HipChatMessageFormatter } from "./hipChatMessage";
import { SlackMessageFormatter } from "./slackMessage";
import { Cache, ExpirationStrategy, MemoryStorage } from "node-ts-cache";

winston.level = process.env.LOG_LEVEL;
const myCache  = new ExpirationStrategy(new MemoryStorage());
const cacheTTL : number = 60 * 60 * 24;

export class App {
    public express;
    private messageFormatters : Commons.MessageFormatter[];
    constructor (formatter? : Commons.MessageFormatter) {
      winston.debug("Booting %s", Constants.APP_NAME);
      this.messageFormatters = [HipChatMessageFormatter.getInstance(), SlackMessageFormatter.getInstance()];
    }

    process (req: Commons.Request, res: Response) : Promise<void> {
        let messageFormatter = Commons.verifyMessage(req, this.messageFormatters);
        if (!messageFormatter) {
            res.status(400).send(Constants.INVALID_MESSAGE_STRING);
            return Commons.ErrorPromiseWrapper(Constants.INVALID_MESSAGE_STRING);
        }


        let restaurantName = messageFormatter.getRestaurantName(req);
        if (!restaurantName) {
            const body = messageFormatter.getErrorMessage(null);
            res.status(400).send(body);
            return Commons.ErrorPromiseWrapper(Constants.INVALID_MESSAGE_STRING);
        }

        restaurantName = restaurantName.trim();

        if (restaurantName.toLowerCase() === Constants.TOTAL_KEYWORD.toLowerCase()) {
            return this.getTotalOrders(res, messageFormatter);
        } else {
            let exactMatch : boolean;

            if (/^".*"$/.test(restaurantName)) {
                exactMatch = true;

                // Cleanup restaurant name from quotes
                restaurantName = restaurantName.replace(/["]+/g, "");
            } else if (/^״.*״$/.test(restaurantName)) {
                exactMatch = true;

                // Cleanup restaurant name from quotes
                restaurantName = restaurantName.replace(/[״]+/g, "");
            } else if (/^'.*'$/.test(restaurantName)) {
                exactMatch = true;

                // Cleanup restaurant name from quotes
                restaurantName = restaurantName.replace(/[']+/g, "");
            }

            return this.search(res, messageFormatter, restaurantName, exactMatch, true);
        }
    }

    //@Cache(myCache, { ttl: 60 * 60 * 24 }) //ttl = 24 hr
    search (res : Response, messageFormatter : Commons.MessageFormatter, restaurantName : string,
        findExact: boolean, useCache? : boolean) : Promise<void> {
        if (!restaurantName || restaurantName.length === 0) { // Behavior for empty command ("/10bis" with no content)
            let body : Commons.TenBisResponse = messageFormatter.getDefaultResponse();
            res.status(400).send(body);
            return Commons.ErrorPromiseWrapper(Constants.INVALID_MESSAGE_STRING);
        }

        if (useCache) {
            return myCache.getItem<Commons.Restaurant[]>(restaurantName).then( (cachedData) => {
                if (cachedData) {
                    const resBody = messageFormatter.generateSearchResponse(
                        Commons.filterByRestaurantName(Commons.sortRestaurantsByDistance(cachedData), findExact, restaurantName));
                    res.json(resBody);
                    return;
                } else {
                    return this.runSearch(res, messageFormatter, restaurantName, findExact);
                }
            });
        }

        return this.runSearch(res, messageFormatter, restaurantName, findExact);
    }


    private runSearch(res : Response, messageFormatter : Commons.MessageFormatter, restaurantName : string, findExact: boolean) : Promise<void> {
        let parsed_url : string = Commons.generateSearchRequest(restaurantName);

        return Commons.RequestGetWrapper(parsed_url)
            .then((body) => {
                let data = JSON.parse(body);

                if (!data || !data.length || data.length < 1) {
                    const badResBody = messageFormatter.getErrorMessage(restaurantName);
                    res.json(badResBody);
                    return;
                }

                return myCache.setItem(restaurantName, data, {  ttl: cacheTTL }).then( () => {
                    const resBody = messageFormatter.generateSearchResponse(
                        Commons.filterByRestaurantName(
                            Commons.sortRestaurantsByDistance(data), findExact, restaurantName));
                    res.json(resBody);
                });
            }).catch((err) => {
                if (err) {
                    winston.debug("Error in Search: " + err);
                } else {
                    winston.debug("Error in Search");
                }
                res.status(400).send(Constants.ERROR_STRING);
            });
    }


    getTotalOrders (res : Response, messageFormatter : Commons.MessageFormatter) : Promise<void> {
            let parsed_url : string = Commons.generateGetTotalOrdersRequest();
            winston.debug("Total Orders Url: " + parsed_url);

            let requestPromise : Promise<string> = Commons.RequestGetWrapper(parsed_url);
            return requestPromise.then((body) => {
                let data : Commons.Restaurant[] = JSON.parse(body);

                if (!data || !(data instanceof Array)) {
                    const resBody = messageFormatter.getErrorMessage(null);
                    res.json(resBody);
                    return;
                }

                let restaurants : Commons.Restaurant[] = data.filter(Commons.filterTotalOrders);

                const resBody = messageFormatter.generateTotalOrdersResponse(Commons.filterByRestaurantName(restaurants, false, null));
                res.json(resBody);

            }).catch( (err) => {
                if (err) {
                    winston.debug("Error in Get Total Orders: " + err);
                } else {
                    winston.debug("Error in Get Total Orders");
                }
                res.status(400).send(Constants.ERROR_STRING);
            });
    }
}
export default new App();