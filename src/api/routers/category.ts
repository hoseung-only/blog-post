import { Router } from "express";
import { body, param } from "express-validator";

import { validateParameters } from "../middlewares/validateParameters";

import { Category } from "../../database/entities/category";

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

  router.get(
    "/:id",
    param("id").isNumeric().withMessage("id must be number"),
    validateParameters,
    async (req, res, next) => {
      try {
        const id = Number(req.params.id);

        const result = await Category.findById(id);

        if (!result) {
          return res.status(404).json({
            message: `category of id [${id}] is not exist`,
          });
        }

        return res.status(200).json({
          result,
        });
      } catch (error) {
        return next(error);
      }
    }
  );

  rootRouter.use("/category", router);
};
