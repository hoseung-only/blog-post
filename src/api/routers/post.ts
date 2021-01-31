import { Router } from "express";
import { query, param, body } from "express-validator";

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

  router.post(
    "/",
    body("title")
      .isString()
      .withMessage("title must be string")
      .exists()
      .withMessage("title must be provided"),
    body("content")
      .isString()
      .withMessage("content must be string")
      .exists()
      .withMessage("title must be provided"),
    body("categoryId")
      .isNumeric()
      .withMessage("categoryId must be number")
      .exists()
      .withMessage("categoryId must be provided"),
    validateParameters,
    async (req, res, next) => {
      try {
        const title = req.body.title as string;
        const content = req.body.content as string;
        const categoryId = Number(req.body.categoryId);

        const result = await Post.create({
          title,
          content,
          categoryId,
        })

        return res.status(201).json({
          result,
        });
      } catch (error) {
        return next(error);
      }
    }
  )

  rootRouter.use("/post", router);
};
