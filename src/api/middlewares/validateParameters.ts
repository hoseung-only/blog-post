import { RequestHandler } from "express";
import { validationResult } from "express-validator";

import { ErrorResponse } from "../../utils/error";

export const validateParameters: RequestHandler = (req, res, next) => {
  const result = validationResult(req);

  // if there were something error with parameters validation
  if (!result.isEmpty()) {
    // return all those errors with 400
    const error = new ErrorResponse(
      400,
      result
        .array()
        .map((error) => `[ERROR] Parameter ${error.param}: ${error.msg}`)
    );

    return next(error);
  }

  // if not, move to the next middleware.
  return next();
};
