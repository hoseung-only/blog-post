import { Router } from "express";
import { query, body } from "express-validator";

import { validateParameters } from "../middlewares/validateParameters";

// This router is only used for test
export const applyTestRouters = (rootRouter: Router) => {
  const router = Router();

  router.get(
    "/",
    query("message")
      .isString()
      .withMessage("message must be string")
      .exists()
      .withMessage("message must be provided"),
    validateParameters,
    (req, res, next) => {
      const message = req.query.message as string;

      return res.status(200).json({
        message,
      });
    }
  );

  router.post(
    "/",
    body("message")
      .isString()
      .withMessage("message must be string")
      .exists()
      .withMessage("message must be provided"),
    validateParameters,
    (req, res, next) => {
      const message = req.query.message as string;

      return res.status(200).json({
        message,
      });
    }
  );

  rootRouter.use("/test", router);
};
