import { Router, RequestHandler, ErrorRequestHandler } from "express";

import { ErrorResponse } from "../utils/error";

import * as Presenters from "./presenters";

export const applyErrorHandlers = (rootRouter: Router) => {
  const notFound: RequestHandler = (req, res, next) => {
    const err = new ErrorResponse(404, "Not Found");
    return next(err);
  };

  const serverError: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof ErrorResponse) {
      return res
        .status(err.statusCode)
        .json(Presenters.presentError(err.message));
    } else {
      return res
        .status(500)
        .json(Presenters.presentError("Internal Server Error"));
    }
  };

  rootRouter.use(notFound);
  rootRouter.use(serverError);
};
