import { RequestHandler } from "express";
import { validationResult } from "express-validator";

import { ErrorResponse } from "../../utils/error";

export const validateParameters: RequestHandler = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const error = new ErrorResponse(
      400,
      result.array().map((error) => `[ERROR] Parameter ${error.param}: ${error.msg}`)
    );

    return next(error);
  }

  return next();
};
