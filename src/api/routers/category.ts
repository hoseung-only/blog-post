import { Router } from "express";
import { body } from "express-validator";

import { validateParameters } from "../middlewares/validateParameters";

import { Category } from "../../database/entities/category";

import * as Presenters from "../presenters";

export const applyCategoryRouters = (rootRouter: Router) => {
  const router = Router();

  router.post(
    "/",
    body("name")
      .isString()
      .withMessage("name must be string")
      .exists()
      .withMessage("name must be provided"),
    body("parentId")
      .isNumeric()
      .withMessage("parentId must be string")
      .optional(),
    validateParameters,
    async (req, res, next) => {
      try {
        const name = req.body.name as string;
        const parentId = (req.body.parentId as number) || undefined;

        const result = await Category.create({ name, parentId });

        return res.status(201).json({
          result,
        });
      } catch (error) {
        return next(error);
      }
    }
  );

  router.get("/list", async (req, res, next) => {
    try {
      const categories = await Category.findAll();

      return res
        .status(200)
        .json(Presenters.presentAllCategories({ categories }));
    } catch (error) {
      return next(error);
    }
  });

  rootRouter.use("/category", router);
};
