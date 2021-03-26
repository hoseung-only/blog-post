import { Router } from "express";
import { query, param, body } from "express-validator";

import { ErrorResponse } from "../../utils/error";

import { validateParameters } from "../middlewares/validateParameters";

import { Post } from "../../database/entities/post";

import * as Presenters from "../presenters";

export const applyPostRouters = (rootRouter: Router) => {
  const router = Router();

  router.get(
    "/",
    query("cursor").isNumeric().withMessage("cursor must be number").optional(),
    validateParameters,
    async (req, res, next) => {
      try {
        const cursor = req.query.cursor ? Number(req.query.cursor) : 0;

        const posts = await Post.findByCursor(cursor);
        const nextCursor =
          posts.length === 10 ? posts[posts.length - 1].id + 1 : null;

        return res
          .status(200)
          .json(Presenters.presentPostList({ posts, nextCursor }));
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

        const post = await Post.findById(id);

        if (!post) {
          throw new ErrorResponse(404, `post of id [${id}] is not exist`);
        }

        return res.status(200).json(Presenters.presentPost({ post }));
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

        const post = await Post.create({
          title,
          content,
          categoryId,
        });

        return res.status(201).json(Presenters.presentPost({ post }));
      } catch (error) {
        return next(error);
      }
    }
  );

  router.delete(
    "/:id",
    param("id").isNumeric().withMessage("ids must be number"),
    validateParameters,
    async (req, res, next) => {
      try {
        const id = Number(req.params.id);

        await Post.deleteByIds([id]);

        return res.status(200).json(Presenters.presentSuccess(true));
      } catch (error) {
        return next(error);
      }
    }
  );

  rootRouter.use("/posts", router);
};
