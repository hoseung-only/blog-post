import { RequestHandler } from "express";
import { validationResult } from "express-validator";

export const validateParameters: RequestHandler = (req, res, next) => {
  const result = validationResult(req);

  // if there were something error with parameters validation
  if (!result.isEmpty()) {
    // return all those errors with 400
    return res.status(400).json({
      messages: result
        .array()
        .map((error) => `[ERROR] Parameter ${error.param}: ${error.msg}`),
    });
  }

  // if not, move to the next middleware.
  next();
};
