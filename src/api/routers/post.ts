import { Router } from "express";
import { query, param } from "express-validator";

import { validateParameters } from "../middlewares/validateParameters";

import { Post } from "../../database/entities/post";

export const applyPostRouters = (rootRouter: Router) => {
  const router = Router();

  router.get(
    "/list",
    query("cursor").isNumeric().withMessage("cursor must be number").optional(),
    validateParameters,
    async (req, res, next) => {
      try {
        const cursor = (req.query.cursor ?? "0") as string;

        const result = await Post.findByCursor(cursor);
        const nextCursor =
          result.length === 15 ? result[result.length - 1].id + 1 : null;

        return res.status(200).json({
          result,
          nextCursor,
        });
      } catch (error) {
        return next(error);
      }
    }
  );

  router.get(
    "/:id",
    param("id").isString().withMessage("id must be string"),
    validateParameters,
    async (req, res, next) => {
      try {
        const id = req.params.id as string;

        const result = await Post.findById(id);

        if (!result) {
          return res.status(404).json({
            message: `post of id [${id}] is not exist`,
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

  rootRouter.use("/post", router);
};
