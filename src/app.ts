import * as express from "express";
import { Request, Response, NextFunction } from "express";

const app = express();

app.get("/hello", (req: Request, res: Response) => {
  return res.status(200).json({
    message: "world",
  });
});

app.get("/error", (req: Request, res: Response, next: NextFunction) => {
  next(new Error);
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new Error("Not Found");
  next(err);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.message === "Not Found") {
    return res.status(404).json({
      message: err.message,
    });
  } else {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export { app };
