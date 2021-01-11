import "reflect-metadata";
import * as express from "express";

import { getRootRouter } from "./api";
export class App {
  private app: express.Application;

  constructor() {
    this.app = express();

    this.app.use("/", getRootRouter());
  }

  public getApplication = () => this.app;
}

export const app = new App().getApplication();
