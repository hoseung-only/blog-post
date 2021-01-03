import * as express from "express";

import { routers } from "./routers";

const app = express();

app.use("/", routers());

export { app };
