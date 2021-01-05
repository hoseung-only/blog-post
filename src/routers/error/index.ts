import { Router, RequestHandler, ErrorRequestHandler } from "express";

export const applyErrorHandlers = (rootRouter: Router) => {
  const notFound: RequestHandler = (req, res, next) => {
    const err = new Error("Not Found");
    next(err);
  };

  const serverError: ErrorRequestHandler = (err, req, res, next) => {
    if (err.message === "Not Found") {
      return res.status(404).json({
        message: err.message,
      });
    } else {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  };

  rootRouter.use(notFound);
  rootRouter.use(serverError);
};
