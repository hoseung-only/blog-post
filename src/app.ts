import * as express from "express";

import { routers } from "./routers";
export class App {
  private app: express.Application;

  constructor () {
    this.app = express();

    this.app.use("/", routers());
  }

  public getApplication = () => this.app;
}

export const app = new App().getApplication();
