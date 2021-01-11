import { Router } from "express";
import { param } from "express-validator";

import { validateParameters } from "../middlewares/validateParameters";

import { Post } from "../../database/entities/post";

export const applyPostRouters = (rootRouter: Router) => {
  const router = Router();

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

  rootRouter.use("/posts", router);
};
