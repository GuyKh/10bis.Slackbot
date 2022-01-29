import { Response } from "express";
import * as winston from "winston";
import axios, { AxiosResponse } from "axios";
import {
  Commons,
  FilterByRestaurantName,
  SortRestaurantsByDistance,
  GenerateSearchRequest,
  VerifyMessage,
  ErrorPromiseWrapper,
  GenerateGetTotalOrdersRequest,
  FilterTotalOrders,
} from "./commons";
import { Constants } from "./constants";
import { HipChatMessageFormatter } from "./hipChatMessage";
import { SlackMessageFormatter } from "./slackMessage";
import { CacheContainer } from "node-ts-cache";
import { MemoryStorage } from "node-ts-cache-storage-memory";

const myCache = new CacheContainer(new MemoryStorage());
const cacheTTL: number = 60 * 60 * 24;


const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: '10bis.slackbot' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
    level: process.env.LOG_LEVEL
  }));
}



export class App {
  public express;
  private messageFormatters: Commons.MessageFormatter[];
  constructor() {
    logger.debug("Booting %s", Constants.APP_NAME);
    this.messageFormatters = [
      HipChatMessageFormatter.getInstance(),
      SlackMessageFormatter.getInstance(),
    ];
  }

  clearCache(): Promise<void> {
    myCache.clear();
    return new Promise<void>((resolve) => resolve());
  }

  process(req: Commons.Request, res: Response): Promise<void> {
    const messageFormatter = VerifyMessage(req, this.messageFormatters);
    if (!messageFormatter) {
      res.status(400).send(Constants.INVALID_MESSAGE_STRING);
      return ErrorPromiseWrapper(Constants.INVALID_MESSAGE_STRING);
    }

    let restaurantName = messageFormatter.getRestaurantName(req);

    if (!restaurantName) {
      const body = messageFormatter.getErrorMessage(null);
      res.status(400).send(body);
      return ErrorPromiseWrapper(Constants.INVALID_MESSAGE_STRING);
    }

    restaurantName = restaurantName.trim();

    if (
      restaurantName.toLowerCase() === Constants.TOTAL_KEYWORD.toLowerCase()
    ) {
      return this.getTotalOrders(res, messageFormatter);
    } else {
      return this.search(res, messageFormatter, restaurantName, true);
    }
  }

  // @Cache(myCache, { ttl: 60 * 60 * 24 }) //ttl = 24 hr
  search(
    res: Response,
    messageFormatter: Commons.MessageFormatter,
    restaurantName: string,
    useCache?: boolean
  ): Promise<void> {
    if (!restaurantName || restaurantName.length === 0) {
      // Behavior for empty command ("/10bis" with no content)
      const body: Commons.TenBisResponse =
        messageFormatter.getDefaultResponse();
      res.status(400).send(body);
      return ErrorPromiseWrapper(Constants.INVALID_MESSAGE_STRING);
    }

    let cleanRestaurantName: string = restaurantName;
    let useExactRestaurantName: boolean = false;
    const exactRestaurantName: string =
      this.getExactRestaurantName(restaurantName);
    if (exactRestaurantName) {
      cleanRestaurantName = exactRestaurantName;
      useExactRestaurantName = true;
    }

    if (useCache) {
      return myCache
        .getItem<Commons.Restaurant[]>(cleanRestaurantName)
        .then((cachedData) => {
          if (cachedData) {
            const resBody = messageFormatter.generateSearchResponse(
              FilterByRestaurantName(
                SortRestaurantsByDistance(cachedData),
                useExactRestaurantName,
                cleanRestaurantName
              )
            );
            res.json(resBody);
          } else {
            return this.runSearch(
              res,
              messageFormatter,
              restaurantName,
              useCache
            );
          }
        });
    }

    return this.runSearch(res, messageFormatter, restaurantName, useCache);
  }

  private runSearch(
    res: Response,
    messageFormatter: Commons.MessageFormatter,
    restaurantName: string,
    useCache: boolean
  ): Promise<void> {
    let useExactRestaurantName: boolean = false;
    const exactRestaurantName: string =
      this.getExactRestaurantName(restaurantName);
    if (exactRestaurantName) {
      restaurantName = exactRestaurantName;
      useExactRestaurantName = true;
    }

    const parsedUrl: string = GenerateSearchRequest(restaurantName);

    return axios
      .get(parsedUrl)
      .then((resp: AxiosResponse<unknown, Commons.Restaurant[]>) => {
        const data = resp.data as Commons.Restaurant[];

        if (!data || !data.length || data.length < 1) {
          const badResBody = messageFormatter.getErrorMessage(restaurantName);
          res.json(badResBody);
          return;
        }

        if (useCache) {
          return myCache
            .setItem(restaurantName, data, { ttl: cacheTTL })
            .then(() => {
              const resBody = messageFormatter.generateSearchResponse(
                FilterByRestaurantName(
                  SortRestaurantsByDistance(data),
                  useExactRestaurantName,
                  restaurantName
                )
              );
              res.json(resBody);
            });
        } else {
          const resBody = messageFormatter.generateSearchResponse(
            FilterByRestaurantName(
              SortRestaurantsByDistance(data),
              useExactRestaurantName,
              restaurantName
            )
          );
          res.json(resBody);
        }
      })
      .catch((err) => {
        logger.debug("Error in Search: " + err);
        res.status(400).send(Constants.ERROR_STRING);
      });
  }

  getTotalOrders(
    res: Response,
    messageFormatter: Commons.MessageFormatter
  ): Promise<void> {
    const parsedUrl: string = GenerateGetTotalOrdersRequest();
    logger.debug("Total Orders Url: " + parsedUrl);

    return axios
      .get(parsedUrl)
      .then((resp) => {
        const data: Commons.Restaurant[] = resp.data as Commons.Restaurant[];

        if (!data || !(data instanceof Array)) {
          const errorMessage = messageFormatter.getErrorMessage(null);
          res.json(errorMessage);
          return;
        }

        const restaurants: Commons.Restaurant[] =
          data.filter(FilterTotalOrders);

        const totalOrderResponse = messageFormatter.generateTotalOrdersResponse(
          FilterByRestaurantName(restaurants, false, null)
        );
        res.json(totalOrderResponse);
      })
      .catch((err) => {
        logger.debug("Error in Get Total Orders: " + err);
        res.status(400).send(Constants.ERROR_STRING);
      });
  }

  // Return the exact restaurant name if it's surrounded with double quotes, otherwise return NULL
  getExactRestaurantName(restaurantName: string): string {
    let exactRestaurantName: string;
    if (/^".*"$/.test(restaurantName)) {
      // Cleanup restaurant name from quotes
      exactRestaurantName = restaurantName.replace(/["]+/g, "");
    } else if (/^״.*״$/.test(restaurantName)) {
      // Cleanup restaurant name from quotes
      exactRestaurantName = restaurantName.replace(/[״]+/g, "");
    } else if (/^'.*'$/.test(restaurantName)) {
      // Cleanup restaurant name from quotes
      exactRestaurantName = restaurantName.replace(/[']+/g, "");
    }
    return exactRestaurantName;
  }
}
export default new App();
