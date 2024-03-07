/* eslint-env node, mocha */
/* eslint no-unused-expressions:"off" */

import { App } from "./../src/app.js";
import { Commons } from "../src/commons.js";
import { HipChatModule } from "../src/hipChatModule.js";
import { SlackModule } from "../src/slackModule.js";
import { SlackMessageFormatter } from "../src/slackMessage.js";
import { HipChatMessageFormatter } from "../src/hipChatMessage.js";
import axios from "axios";
import "mocha";
import { expect } from "chai";
import {
  validSlackMessage,
  validHipChatMessage,
  slackInvalidMessage,
  hipChatInvalidMessage,
  deepCopy,
} from "./testCommons.js";
import { Constants } from "../src/constants.js";
import * as sinon from "sinon";
import httpMocks from "node-mocks-http";
import nock from "nock";

const app: App = new App();
const slackReq: Commons.Request = new SlackModule.SlackRequest(
  validSlackMessage,
);
const badSlackReq: Commons.Request = new SlackModule.SlackRequest(
  slackInvalidMessage,
);
const hipChatReq: Commons.Request = new HipChatModule.HipChatReq(
  validHipChatMessage,
);
const badHipChatReq: Commons.Request = new HipChatModule.HipChatReq(
  hipChatInvalidMessage,
);
const badRestaurantName: string = "BlaBlaBla";

class EmptyRequest implements Commons.Request {
  body: any;
}

class StaticMethodHolder {
  public static RequestGet;
}

axios.defaults.adapter = "http";

describe("App", () => {
  let res;
  beforeEach(function () {
    res = httpMocks.createResponse();
  });

  it("process() should return one restaurant if valid Slack message", () => {
    return app.process(slackReq, res).then(() => {
      expect(res.statusCode).to.equal(200);

      const body = res._getJSONData();
      expect(body).not.to.equal(null);
      const slackRes: SlackModule.SlackResponse = body;

      expect(slackRes).not.to.equal(null);
      expect(slackRes).not.to.be.undefined;
      expect(slackRes.text).to.equal("Found 1 restaurants");
      expect(slackRes.response_type).to.equal("in_channel");
      expect(slackRes.attachments).not.to.equal(null);
      expect(slackRes.attachments.length).to.equal(1);
      expect(slackRes.attachments[0].title).to.contain(validSlackMessage.text);
    });
  });
  it('process() should return one restaurant if valid Slack message with quotes (") ', () => {
    const req: SlackModule.SlackRequest = deepCopy(slackReq);
    req.body.text = '"ליב"'; // "ליב"

    return app.process(req, res).then(() => {
      expect(res.statusCode).to.equal(200);

      const body = res._getJSONData();
      expect(body).not.to.equal(null);
      const slackRes: SlackModule.SlackResponse = body;

      expect(slackRes).not.to.equal(null);
      expect(slackRes).not.to.be.undefined;
      expect(slackRes.text).to.equal("Found 1 restaurants"); // Exactly one
      expect(slackRes.response_type).to.equal("in_channel");
      expect(slackRes.attachments.length).to.equal(1);
    });
  });
  it("process() should return one restaurant if valid Slack message with quotes (') ", () => {
    const req: SlackModule.SlackRequest = deepCopy(slackReq);
    req.body.text = "'ליב'"; // "ליב"

    return app.process(req, res).then(() => {
      expect(res.statusCode).to.equal(200);

      const body = res._getJSONData();
      expect(body).not.to.equal(null);
      const slackRes: SlackModule.SlackResponse = body;

      expect(slackRes).not.to.equal(null);
      expect(slackRes).not.to.be.undefined;
      expect(slackRes.text).to.equal("Found 1 restaurants"); // Exactly one
      expect(slackRes.response_type).to.equal("in_channel");
      expect(slackRes.attachments.length).to.equal(1);
    });
  });
  it("process() should return one restaurant if valid Slack message with quotes (״) ", () => {
    const req: SlackModule.SlackRequest = deepCopy(slackReq);
    req.body.text = "״ליב״"; // "ליב"

    return app.process(req, res).then(() => {
      expect(res.statusCode).to.equal(200);

      const body = res._getJSONData();
      expect(body).not.to.equal(null);
      const slackRes: SlackModule.SlackResponse = body;

      expect(slackRes).not.to.equal(null);
      expect(slackRes).not.to.be.undefined;
      expect(slackRes.text).to.equal("Found 1 restaurants"); // Exactly one
      expect(slackRes.response_type).to.equal("in_channel");
      expect(slackRes.attachments.length).to.equal(1);
    });
  });
  it("process() should return one restaurant if valid Slack message with quotes (״) and then cache return all ", () => {
    const newRes = httpMocks.createResponse();
    const req: SlackModule.SlackRequest = deepCopy(slackReq);
    req.body.text = "״ליב״"; // "ליב"

    return app
      .process(req, res)
      .then(() => {
        expect(res.statusCode).to.equal(200);

        const body = res._getJSONData();
        expect(body).not.to.equal(null);
        const slackRes: SlackModule.SlackResponse = body;

        expect(slackRes).not.to.equal(null);
        expect(slackRes).not.to.be.undefined;
        expect(slackRes.text).to.equal("Found 1 restaurants"); // Exactly one
        expect(slackRes.response_type).to.equal("in_channel");
        expect(slackRes.attachments.length).to.equal(1);
      })
      .then(() => {
        const newReq: SlackModule.SlackRequest = deepCopy(slackReq);
        newReq.body.text = "ליב"; // "ליב"

        return app.process(newReq, newRes);
      })
      .then(() => {
        expect(newRes.statusCode).to.equal(200);

        const body = newRes._getJSONData();
        expect(body).not.to.equal(null);
        const slackRes: SlackModule.SlackResponse = body;

        expect(slackRes).not.to.equal(null);
        expect(slackRes).not.to.be.undefined;
        expect(slackRes.text).not.to.equal("Found 1 restaurants"); // Not one;
      });
  });
  it("process() should return all restaurants cache and then return one restaurant if valid Slack message with quotes (״) from cache", () => {
    const newRes = httpMocks.createResponse();
    const req: SlackModule.SlackRequest = deepCopy(slackReq);
    req.body.text = "ליב"; // "ליב"

    return app
      .process(req, res)
      .then(() => {
        expect(res.statusCode).to.equal(200);

        const body = res._getJSONData();
        expect(body).not.to.equal(null);
        const slackRes: SlackModule.SlackResponse = body;

        expect(slackRes).not.to.equal(null);
        expect(slackRes).not.to.be.undefined;
        expect(slackRes.text).not.to.equal("Found 1 restaurants"); // Exactly one
      })
      .then(() => {
        const newReq: SlackModule.SlackRequest = deepCopy(slackReq);
        newReq.body.text = "״ליב״"; // "ליב"

        return app.process(newReq, newRes);
      })
      .then(() => {
        expect(newRes.statusCode).to.equal(200);

        const body = newRes._getJSONData();
        expect(body).not.to.equal(null);
        const slackRes: SlackModule.SlackResponse = body;

        expect(slackRes).not.to.equal(null);
        expect(slackRes).not.to.be.undefined;
        expect(slackRes.text).to.equal("Found 1 restaurants"); // Not one;
        expect(slackRes.response_type).to.equal("in_channel");
        expect(slackRes.attachments.length).to.equal(1);
      });
  });
  it("process() should return one restaurant if valid Slack message withoud quotes", () => {
    const req: SlackModule.SlackRequest = deepCopy(slackReq);
    req.body.text = "ליב";

    return app.process(req, res).then(() => {
      expect(res.statusCode).to.equal(200);

      const body = res._getJSONData();
      expect(body).not.to.equal(null);
      const slackRes: SlackModule.SlackResponse = body;

      expect(slackRes).not.to.equal(null);
      expect(slackRes).not.to.be.undefined;
      expect(slackRes.text).not.to.equal("Found 1 restaurants"); // More than one
      expect(slackRes.response_type).to.equal("in_channel");
    });
  });
  it("process() should return one restaurant if valid HipChat message", () => {
    return app.process(hipChatReq, res).then(() => {
      expect(res.statusCode).to.equal(200);

      const body = res._getJSONData();
      expect(body).not.to.equal(null);
      const hipChatRes: HipChatModule.HipChatResponse = body;
      expect(hipChatRes).not.to.equal(null);
      expect(hipChatRes).not.to.be.undefined;

      expect(hipChatRes.message.replace(/^\s+|\s+$/g, "")).to.equal(
        "Found 1 restaurants",
      );
      expect(hipChatRes.message_format).to.equal("text");
      expect(hipChatRes.card).not.to.equal(null);

      let message = validHipChatMessage.item.message.message;
      if (message.indexOf(HipChatMessageFormatter.COMMAND_OPERATOR) === 0) {
        message = message.slice(
          HipChatMessageFormatter.COMMAND_OPERATOR.length + 1,
        );
      }
      expect(hipChatRes.card.title).to.contain(message);
    });
  });
  it("process() should return default message if invalid Slack message", () => {
    return app.process(badSlackReq, res).catch(() => {
      expect(res.statusCode).to.equal(400);

      const body = res._getData();
      expect(body).not.to.equal(null);
      expect(body).not.to.be.an.instanceof(SlackModule.SlackResponse);
      expect(body).to.equal(Constants.INVALID_MESSAGE_STRING);
    });
  });
  it("process() should return default if invalid HipChat message", () => {
    app.process(badHipChatReq, res).catch(() => {
      expect(res.statusCode).to.equal(400);

      const body = res._getData();
      expect(body).not.to.equal(null);
      expect(body).not.to.be.an.instanceof(HipChatModule.HipChatResponse);
      expect(body).to.equal(Constants.INVALID_MESSAGE_STRING);
    });
  });
  it("process() should return default if invalid message", () => {
    app.process(new EmptyRequest(), res).catch(() => {
      expect(res.statusCode).to.equal(400);

      const body = res._getData();

      expect(body).not.to.equal(null);
      expect(body).to.equal(Constants.INVALID_MESSAGE_STRING);
    });
  });
  it("process() should return no restaurants if valid Slack message returns nothing", () => {
    const slackEmptyReq: SlackModule.SlackRequest = deepCopy(slackReq);
    slackEmptyReq.body.text = badRestaurantName;

    return app.process(slackEmptyReq, res).then(() => {
      expect(res.statusCode).to.be.equal(200);
      const body = res._getJSONData();
      expect(body).not.to.equal(null);
      const slackRes: SlackModule.SlackResponse = body;

      expect(slackRes).not.to.equal(null);
      expect(slackRes).not.to.be.undefined;

      expect(slackRes.text).to.equal(
        Constants.NO_RESTAURANTS_FOUND_STRING + " for: " + badRestaurantName,
      );
      expect(slackRes.response_type).to.equal("ephemeral");
      expect(slackRes.attachments).to.equal(null);
    });
  });
  it("process() should return no restaurants if valid HipChat message returns nothing", () => {
    const hipChatEmptyReq: HipChatModule.HipChatReq = deepCopy(hipChatReq);
    hipChatEmptyReq.body.item.message.message =
      HipChatMessageFormatter.COMMAND_OPERATOR + " " + badRestaurantName;

    return app.process(hipChatEmptyReq, res).then(() => {
      expect(res.statusCode).to.be.equal(200);
      const body = res._getJSONData();
      expect(body).not.to.equal(null);
      const hipChatRes: HipChatModule.HipChatResponse = body;
      expect(hipChatRes).not.to.equal(null);
      expect(hipChatRes).not.to.be.undefined;

      expect(hipChatRes.message.replace(/^\s+|\s+$/g, "")).to.equal(
        Constants.NO_RESTAURANTS_FOUND_STRING + " for: " + badRestaurantName,
      );
      expect(hipChatRes.message_format).to.equal("text");
      expect(hipChatRes.card).not.to.equal(null);

      let message = validHipChatMessage.item.message.message;
      if (message.indexOf(HipChatMessageFormatter.COMMAND_OPERATOR) === 0) {
        message = message.slice(
          HipChatMessageFormatter.COMMAND_OPERATOR.length + 1,
        );
      }
    });
  });
  it("process() should return valid response if command is total", () => {
    const slackTotalReq: SlackModule.SlackRequest = deepCopy(slackReq);
    slackTotalReq.body.text = Constants.TOTAL_KEYWORD;

    app.process(slackTotalReq, res).then(() => {
      expect(res.statusCode).to.be.equal(200);
      const body = res._getJSONData();
      expect(body).not.to.equal(null);
      const slackRes: SlackModule.SlackResponse = body;

      expect(slackRes).not.to.equal(null);
      expect(slackRes).not.to.be.undefined;
      expect(slackRes.response_type).to.equal("in_channel");
    });
  });
  it("process() should return error if using empty restaurant name for slack", () => {
    const slackTotalReq: SlackModule.SlackRequest = deepCopy(slackReq);
    slackTotalReq.body.text = "";

    app.process(slackTotalReq, res).catch(() => {
      expect(res.statusCode).to.be.equal(400);
      const body = res._getJSONData();
      expect(body).not.to.equal(null);
      const slackRes: SlackModule.SlackResponse = body;

      expect(slackRes).not.to.equal(null);
      expect(slackRes).not.to.be.undefined;
      expect(slackRes.response_type).to.equal("ephemeral");
      expect(slackRes.text).to.equal(Constants.NO_RESTAURANTS_FOUND_STRING);
    });
  });
  it("process() should return error if using empty restaurant name for hipchat", () => {
    const hipChatRequest: HipChatModule.HipChatReq = deepCopy(hipChatReq);
    hipChatRequest.body.item.message.message = "/10bis ";
    app.process(hipChatRequest, res).catch(() => {
      expect(res.statusCode).to.be.equal(400);
      const body = res._getJSONData();
      expect(body).not.to.equal(null);
      const hipChatResponse: HipChatModule.HipChatResponse = body;

      expect(hipChatResponse).not.to.equal(null);
      expect(hipChatResponse.message_format).to.equal("text");
      expect(hipChatResponse.message).to.equal(
        Constants.NO_RESTAURANTS_FOUND_STRING,
      );
    });
  });
  it("process() should return no restaurants if valid HipChat message returns nothing", () => {
    const hipChatTotalReq: HipChatModule.HipChatReq = deepCopy(hipChatReq);
    hipChatTotalReq.body.item.message.message =
      HipChatMessageFormatter.COMMAND_OPERATOR + " " + Constants.TOTAL_KEYWORD;
    return app.process(hipChatTotalReq, res).then(() => {
      expect(res.statusCode).to.be.equal(200);
      const body = res._getJSONData();
      expect(body).not.to.equal(null);
      const hipChatRes: HipChatModule.HipChatResponse = body;
      expect(hipChatRes).not.to.equal(null);
      expect(hipChatRes).not.to.be.undefined;
      expect(hipChatRes.message_format).to.equal("text");
    });
  });
  it("getTotalOrders() should return valid response if command is total (slack)", () => {
    return app
      .getTotalOrders(res, SlackMessageFormatter.getInstance())
      .then(() => {
        expect(res.statusCode).to.be.equal(200);
        const body = res._getJSONData();
        expect(body).not.to.equal(null);
        const slackRes: SlackModule.SlackResponse = body;

        expect(slackRes).not.to.equal(null);
        expect(slackRes).not.to.be.undefined;
        expect(slackRes.response_type).to.equal("in_channel");
      });
  });
  it("getTotalOrders() should return valid response if command is total (HipChat)", () => {
    return app
      .getTotalOrders(res, HipChatMessageFormatter.getInstance())
      .then(() => {
        expect(res.statusCode).to.be.equal(200);
        const body = res._getJSONData();
        expect(body).not.to.equal(null);
        const hipChatRes: HipChatModule.HipChatResponse = body;
        expect(hipChatRes).not.to.equal(null);
        expect(hipChatRes).not.to.be.undefined;
        expect(hipChatRes.message_format).to.equal("text");
      });
  });
  it("search() with null restaurant name - Slack", () => {
    return app
      .search(res, SlackMessageFormatter.getInstance(), null, false)
      .catch(() => {
        expect(res.statusCode).to.be.equal(400);
        const body = res._getData();
        expect(body).not.to.equal(null);
        const slackRes: SlackModule.SlackResponse = body;

        expect(slackRes).not.to.equal(null);
        expect(slackRes).not.to.be.undefined;
        expect(slackRes.response_type).to.equal("ephemeral");
        expect(slackRes.text).to.equal(Constants.DEFAULT_RESPONSE);
      });
  });
  it("search() with null restaurant name - HipChat", () => {
    return app
      .search(res, HipChatMessageFormatter.getInstance(), null, false)
      .catch(() => {
        expect(res.statusCode).to.be.equal(400);
        const body = res._getData();
        expect(body).not.to.equal(null);
        const hipChatResponse: HipChatModule.HipChatResponse = body;

        expect(hipChatResponse).not.to.equal(null);
        expect(hipChatResponse.message_format).to.equal("text");
        expect(hipChatResponse.message).to.equal(Constants.DEFAULT_RESPONSE);
      });
  });
  it("search() with empty restaurant name - Slack", () => {
    return app
      .search(res, SlackMessageFormatter.getInstance(), "", false)
      .catch(() => {
        expect(res.statusCode).to.be.equal(400);
        const body = res._getData();
        expect(body).not.to.equal(null);
        const slackRes: SlackModule.SlackResponse = body;

        expect(slackRes).not.to.equal(null);
        expect(slackRes).not.to.be.undefined;
        expect(slackRes.response_type).to.equal("ephemeral");
        expect(slackRes.text).to.equal(Constants.DEFAULT_RESPONSE);
      });
  });
  it("search() with empty restaurant name - HipChat", () => {
    return app
      .search(res, HipChatMessageFormatter.getInstance(), "", false)
      .catch(() => {
        expect(res.statusCode).to.be.equal(400);
        const body = res._getData();
        expect(body).not.to.equal(null);
        const hipChatResponse: HipChatModule.HipChatResponse = body;

        expect(hipChatResponse).not.to.equal(null);
        expect(hipChatResponse.message_format).to.equal("text");
        expect(hipChatResponse.message).to.equal(Constants.DEFAULT_RESPONSE);
      });
  });
  describe("Test Cache", () => {
    beforeEach(function () {
      StaticMethodHolder.RequestGet = sinon.spy(axios, "get");
      app.clearCache();
    });

    afterEach(function () {
      (StaticMethodHolder.RequestGet as sinon.SinonStub).restore();
    });

    it("process() should use cache instead of calling individual calls every time", () => {
      let res = httpMocks.createResponse();

      const req: SlackModule.SlackRequest = deepCopy(slackReq);
      req.body.text = "ניני";

      return app.process(req, res).then(() => {
        expect(res.statusCode).to.equal(200);

        const body = res._getJSONData();
        expect(body).not.to.equal(null);
        const slackRes: SlackModule.SlackResponse = body;
        expect(slackRes).not.to.equal(null);

        res = httpMocks.createResponse();
        return app
          .process(req, res)
          .then(() => {
            expect(res.statusCode).to.equal(200);

            const body = res._getJSONData();
            expect(body).not.to.equal(null);
            const slackRes: SlackModule.SlackResponse = body;
            expect(slackRes).not.to.equal(null);
          })
          .then(() => {
            sinon.assert.calledOnce(StaticMethodHolder.RequestGet);
          });
      });
    });

    it("search() should use cache instead of calling individual calls every time", () => {
      let res = httpMocks.createResponse();
      const restName: string = "אנסטסיה";
      return app
        .search(res, SlackMessageFormatter.getInstance(), restName, true)
        .then(() => {
          expect(res.statusCode).to.be.equal(200);
          const body = res._getJSONData();
          expect(body).not.to.equal(null);
          const slackRes: SlackModule.SlackResponse = body;
          expect(slackRes).not.to.equal(null);
          res = httpMocks.createResponse();
          return app
            .search(res, SlackMessageFormatter.getInstance(), restName, true)
            .then(() => {
              expect(res.statusCode).to.equal(200);

              const body = res._getJSONData();
              expect(body).not.to.equal(null);
              const slackRes: SlackModule.SlackResponse = body;
              expect(slackRes).not.to.equal(null);
            });
        })
        .then(() => {
          sinon.assert.calledOnce(StaticMethodHolder.RequestGet);
        });
    });
    it("search() should not use cache if flag is off", () => {
      let res = httpMocks.createResponse();
      const restName: string = "ליב";
      return app
        .search(res, SlackMessageFormatter.getInstance(), restName, false)
        .then(() => {
          expect(res.statusCode).to.be.equal(200);
          const body = res._getJSONData();
          expect(body).not.to.equal(null);
          const slackRes: SlackModule.SlackResponse = body;
          expect(slackRes).not.to.equal(null);

          res = httpMocks.createResponse();
          return app
            .search(res, SlackMessageFormatter.getInstance(), restName, false)
            .then(() => {
              expect(res.statusCode).to.equal(200);

              const body = res._getJSONData();
              expect(body).not.to.equal(null);
              const slackRes: SlackModule.SlackResponse = body;
              expect(slackRes).not.to.equal(null);
            });
        })
        .then(() => {
          sinon.assert.calledTwice(StaticMethodHolder.RequestGet);
        });
    });
    it("search() should not cache restaurants which are not found", () => {
      let res = httpMocks.createResponse();
      const restName: string = "מממ";
      return app
        .search(res, SlackMessageFormatter.getInstance(), restName, true)
        .then(() => {
          expect(res.statusCode).to.be.equal(200);
          const body = res._getJSONData();
          expect(body).not.to.equal(null);
          const slackRes: SlackModule.SlackResponse = body;
          expect(slackRes).not.to.equal(null);

          res = httpMocks.createResponse();
          return app
            .search(res, SlackMessageFormatter.getInstance(), restName, true)
            .then(() => {
              expect(res.statusCode).to.equal(200);

              const body = res._getJSONData();
              expect(body).not.to.equal(null);
              const slackRes: SlackModule.SlackResponse = body;
              expect(slackRes).not.to.equal(null);
            });
        })
        .then(() => {
          sinon.assert.calledTwice(StaticMethodHolder.RequestGet);
        });
    });
  });

  // describe("ResponseCode from 10bis != 200", () => {
  //   it("process() with other response than 200", () => {

  //     const req: SlackModule.SlackRequest = deepCopy(slackReq);
  //     req.body.text = "ABCD";

  //     const scope = nock('https://www.10bis.co.il')
  //     .get('/Restaurants/SearchRestaurants')
  //     .query(() => {
  //       // return true for matched
  //       return true
  //     })
  //     .reply(201, { message: "problem" })

  //     return app
  //       .process(req, res)
  //       .then(() => {
  //         throw new Error("I shouldn't be here");
  //       })
  //       .catch(() => {
  //         expect(res.statusCode).to.be.equal(400);
  //         const body = res._getData();

  //         expect(body).not.to.equal(null);
  //         expect(body).not.to.be.an.instanceof(SlackModule.SlackResponse);
  //         expect(body).to.be.equal(Constants.ERROR_STRING);
  //       }).then(() => {
  //         scope.done();
  //       });
  //   });

  //   it("search() with response code = 201", () => {

  //     const scope = nock('https://www.10bis.co.il')
  //     .get('/Restaurants/SearchRestaurants')
  //     .query(() => {
  //       // return true for matched
  //       return true
  //     })
  //     .reply(201, { message: "problem" })

  //     return app
  //       .search(
  //         res,
  //         SlackMessageFormatter.getInstance(),
  //         badRestaurantName,
  //         false,
  //       )
  //       .then(() => {
  //         throw new Error("I shouldn't be here");
  //       })
  //       .catch(() => {
  //         expect(res.statusCode).to.be.equal(400);
  //         const body = res._getData();

  //         expect(body).not.to.equal(null);
  //         expect(body).not.to.be.an.instanceof(SlackModule.SlackResponse);
  //         expect(body).to.be.equal(Constants.ERROR_STRING);
  //       }).then(() => {
  //         scope.done();
  //       });;
  //   });
  //   it("getTotalOrders() with error = 201", () => {

  //     const scope = nock('https://www.10bis.co.il')
  //     .get('/Restaurants/SearchRestaurants')
  //     .query(() => {
  //       // return true for matched
  //       return true
  //     })
  //     .reply(201, { message: "problem" })

  //     return app
  //       .getTotalOrders(res, SlackMessageFormatter.getInstance())
  //       .then(() => {
  //         throw new Error("I shouldn't be here");
  //       })
  //       .catch(() => {
  //         expect(res.statusCode).to.be.equal(400);
  //         const body = res._getData();

  //         expect(body).not.to.equal(null);
  //         expect(body).not.to.be.an.instanceof(SlackModule.SlackResponse);
  //         expect(body).to.be.equal(Constants.ERROR_STRING);
  //       }).then(() => {
  //         scope.done();
  //       });;
  //   });
  // });

  describe("ResponseCode from 10bis == 200 with empty response", () => {
    let scope;
    beforeEach(function () {
      scope = nock("https://www.10bis.co.il")
        .get("/Restaurants/SearchRestaurants")
        .query(() => {
          // return true for matched
          return true;
        })
        .reply(200, "");
    });

    afterEach(function () {
      scope.done();
    });

    it("process() with response == 200 with empty content", () => {
      const restaurantName: string = "ABCDEF";
      const req: SlackModule.SlackRequest = deepCopy(slackReq);
      req.body.text = restaurantName;

      return app
        .process(req, res)
        .then(() => {
          throw new Error("I shouldn't be here");
        })
        .catch(() => {
          expect(res.statusCode).to.be.equal(200);
          const body = res._getJSONData();
          expect(body).not.to.equal(null);
          const slackRes: SlackModule.SlackResponse = body;

          expect(slackRes).not.to.equal(null);
          expect(slackRes).not.to.be.undefined;
          expect(slackRes.text).to.equal(
            Constants.NO_RESTAURANTS_FOUND_STRING + " for: " + restaurantName,
          );
          expect(slackRes.response_type).to.equal("ephemeral");
          expect(slackRes.attachments).to.equal(null);
        });
    });
    it("search() with response == 200 with empty content", () => {
      return app
        .search(
          res,
          SlackMessageFormatter.getInstance(),
          badRestaurantName,
          false,
        )
        .then(() => {
          throw new Error("I shouldn't be here");
        })
        .catch(() => {
          expect(res.statusCode).to.be.equal(200);
          const body = res._getJSONData();
          expect(body).not.to.equal(null);
          const slackRes: SlackModule.SlackResponse = body;

          expect(slackRes).not.to.equal(null);
          expect(slackRes).not.to.be.undefined;
          expect(slackRes.text).to.equal(
            Constants.NO_RESTAURANTS_FOUND_STRING +
              " for: " +
              badRestaurantName,
          );
          expect(slackRes.response_type).to.equal("ephemeral");
          expect(slackRes.attachments).to.equal(null);
        });
    });
    it("getTotalOrders() with response == 200 with empty content", () => {
      return app
        .getTotalOrders(res, SlackMessageFormatter.getInstance())
        .then(() => {
          throw new Error("I shouldn't be here");
        })
        .catch(() => {
          expect(res.statusCode).to.be.equal(200);
          const body = res._getJSONData();
          expect(body).not.to.equal(null);
          const slackRes: SlackModule.SlackResponse = body;

          expect(slackRes).not.to.equal(null);
          expect(slackRes).not.to.be.undefined;
          expect(slackRes.text).to.equal(Constants.NO_RESTAURANTS_FOUND_STRING);
          expect(slackRes.response_type).to.equal("ephemeral");
          expect(slackRes.attachments).to.equal(null);
        });
    });
  });

  describe("Response from 10bis is error (400)", () => {
    let scope;
    beforeEach(function () {
      scope = nock("https://www.10bis.co.il")
        .get("/Restaurants/SearchRestaurants")
        .query(() => {
          // return true for matched
          return true;
        })
        .reply(400, { message: "problem" });
    });

    afterEach(function () {
      scope.done();
    });

    it("process() with error (400)", () => {
      const req: SlackModule.SlackRequest = deepCopy(slackReq);
      req.body.text = "Aaaa";

      return app
        .process(req, res)
        .then(() => {
          throw new Error("I shouldn't be here");
        })
        .catch(() => {
          expect(res.statusCode).to.be.equal(400);
          const body = res._getData();

          expect(body).not.to.equal(null);
          expect(body).not.to.be.an.instanceof(SlackModule.SlackResponse);
          expect(body).to.be.equal(Constants.ERROR_STRING);
        });
    });
    it("search() with error (400)", () => {
      return app
        .search(
          res,
          SlackMessageFormatter.getInstance(),
          badRestaurantName,
          false,
        )
        .then(() => {
          throw new Error("I shouldn't be here");
        })
        .catch(() => {
          expect(res.statusCode).to.be.equal(400);
          const body = res._getData();

          expect(body).not.to.equal(null);
          expect(body).not.to.be.an.instanceof(HipChatModule.HipChatResponse);
          expect(body).to.be.equal(Constants.ERROR_STRING);
        });
    });
    it("getTotalOrders() with error (400)", () => {
      return app
        .getTotalOrders(res, SlackMessageFormatter.getInstance())
        .then(() => {
          throw new Error("I shouldn't be here");
        })
        .catch(() => {
          expect(res.statusCode).to.be.equal(400);
          const body = res._getData();

          expect(body).not.to.equal(null);
          expect(body).not.to.be.an.instanceof(HipChatModule.HipChatResponse);
          expect(body).to.be.equal(Constants.ERROR_STRING);
        });
    });
  });
});
