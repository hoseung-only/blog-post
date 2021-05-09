import { Router } from "express";
import { body, param } from "express-validator";

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
      .withMessage("parentId must be number")
      .optional(),
    validateParameters,
    async (req, res, next) => {
      try {
        const name = req.body.name as string;
        const parentId = (req.body.parentId as number) || undefined;

        const category = await Category.create({ name, parentId });

        return res.status(201).json(Presenters.presentCategory({ category }));
      } catch (error) {
        return next(error);
      }
    }
  );

  router.get("/", async (req, res, next) => {
    try {
      const categories = await Category.findAll();

      return res
        .status(200)
        .json(Presenters.presentAllCategories({ categories }));
    } catch (error) {
      return next(error);
    }
  });

  router.delete(
    "/:id",
    param("id").isNumeric().withMessage("id must be number"),
    validateParameters,
    async (req, res, next) => {
      try {
        const id = Number(req.params.id);

        await Category.deleteByIds([id]);

        return res.status(200).json(Presenters.presentSuccess(true));
      } catch (error) {
        return next(error);
      }
    }
  );

  rootRouter.use("/categories", router);
};
