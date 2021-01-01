import * as express from "express";

const app = express();

app.get("/hello", (req: express.Request, res: express.Response) => {
  return res.status(200).json({ message: "world" });
});

export { app };
