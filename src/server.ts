/* istanbul ignore file */
import * as bodyParser from "body-parser";
import * as errorHandler from "errorhandler";
import * as express from "express";
import { Commons } from "./commons";
import { App } from "./app";
import { Response } from "express";

/**
 * The server.
 *
 * @class Server
 */
export class Server {
  public app: express.Application;

  /**
   * Bootstrap the application.
   *
   * @class Server
   * @method bootstrap
   * @static
   * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
   */
  public static bootstrap(): Server {
    return new Server();
  }

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor() {
    // create expressjs application
    this.app = express();

    // configure application
    this.config();

    // add routes
    this.routes();

    // add api
    this.api();
  }

  /**
   * Create REST API routes
   *
   * @class Server
   * @method api
   */
  public api() {
    // empty for now
  }

  /**
   * Configure application
   *
   * @class Server
   * @method config
   */
  public config() {
    // mount json form parser
    this.app.use(bodyParser.json());

    // mount query string parser
    this.app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );

    // catch 404 and forward to error handler
    this.app.use(function (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) {
      err.status = 404;
      next(err);
    });

    // error handling
    this.app.use(errorHandler());
  }

  /**
   * Create and return Router.
   *
   * @class Server
   * @method config
   * @return void
   */
  private routes() {
    const router: express.Router = express.Router();

    const app = new App();
    router.get("/", function (req: Commons.Request, res: Response) {
      res.send("Sanity passed!");
    });

    router.post("/post", function (req: Commons.Request, res: Response) {
      app.process(req, res);
    });

    this.app.use("/", router);
    this.app.use("/post", router);

    // use router middleware
    this.app.use(router);
  }
}
