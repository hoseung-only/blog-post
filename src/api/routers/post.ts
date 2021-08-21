import { Router } from "express";
import { query, param, body } from "express-validator";

import { ErrorResponse } from "../../utils/error";

import { validateParameters } from "../middlewares/validateParameters";

import { Post } from "../../database/mysql/post";
import { postViewedIP } from "../../database/dynamo/postViewedIP";

import * as Presenters from "../presenters";

export const applyPostRouters = (rootRouter: Router) => {
  const router = Router();

  router.get(
    "/",
    query("count").isNumeric().withMessage("count must be number").exists().withMessage("count must be provided"),
    query("cursor").isNumeric().withMessage("cursor must be number").optional(),
    validateParameters,
    async (req, res, next) => {
      try {
        const count = Number(req.query.count);
        const cursor = req.query.cursor ? Number(req.query.cursor) : 0;

        const posts = await Post.findByCursor({ count, cursor });
        const nextCursor = posts.length === count ? posts[posts.length - 1].createdAt.valueOf() : null;

        return res.status(200).json(Presenters.presentPostList({ posts, nextCursor }));
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

        const post = await Post.findById(id);

        if (!post) {
          throw new ErrorResponse(404, `post of id [${id}] does not exist`);
        }

        return res.status(200).json(Presenters.presentPost({ post }));
      } catch (error) {
        return next(error);
      }
    }
  );

  router.patch(
    "/:id/view_count",
    param("id").isString().withMessage("id must be string"),
    validateParameters,
    async (req, res, next) => {
      try {
        const postId = req.params.id as string;
        const ip = req.ips[0];

        if (await postViewedIP.find({ ip, postId })) {
          return res.status(200).json(Presenters.presentSuccess(false));
        }

        await Post.increaseViewCount(postId);
        await postViewedIP.create({ ip, postId, expiredAt: new Date(Date.now() + 86400000).valueOf() });

        return res.status(200).json(Presenters.presentSuccess(true));
      } catch (error) {
        return next(error);
      }
    }
  );

  router.post(
    "/",
    body("title").isString().withMessage("title must be string").exists().withMessage("title must be provided"),
    body("coverImageURL").isString().withMessage("coverImageURL must be string").exists(),
    body("content").isString().withMessage("content must be string").exists().withMessage("title must be provided"),
    body("categoryId").isString().withMessage("categoryId must be string").optional(),
    body("summary").isString().withMessage("summary must be string").exists().withMessage("summary must be provided"),
    validateParameters,
    async (req, res, next) => {
      try {
        const title = req.body.title as string;
        const coverImageURL = req.body.coverImageURL as string;
        const content = req.body.content as string;
        const categoryId = req.body.categoryId as string | undefined;
        const summary = req.body.summary as string;

        const post = await Post.create({
          title,
          coverImageURL,
          content,
          categoryId,
          summary,
        });

        return res.status(201).json(Presenters.presentPost({ post }));
      } catch (error) {
        return next(error);
      }
    }
  );

  router.put(
    "/:id",
    param("id").isString().withMessage("id must be string"),
    body("title").isString().withMessage("title must be string").exists().withMessage("title must be provided"),
    body("coverImageURL").isString().withMessage("coverImageURL must be string").exists(),
    body("content").isString().withMessage("content must be string").exists().withMessage("title must be provided"),
    body("categoryId").isString().withMessage("categoryId must be string").optional(),
    body("summary").isString().withMessage("summary must be string").exists().withMessage("summary must be provided"),
    validateParameters,
    async (req, res, next) => {
      try {
        const id = req.params.id as string;
        const title = req.body.title as string;
        const coverImageURL = req.body.coverImageURL as string;
        const content = req.body.content as string;
        const categoryId = req.body.categoryId as string | undefined;
        const summary = req.body.summary as string;

        const post = await Post.update({
          id,
          title,
          coverImageURL,
          content,
          categoryId,
          summary,
        });

        return res.status(200).json(Presenters.presentPost({ post }));
      } catch (error) {
        return next(error);
      }
    }
  );

  router.delete(
    "/:id",
    param("id").isString().withMessage("id must be string"),
    validateParameters,
    async (req, res, next) => {
      try {
        const id = req.params.id as string;

        await Post.deleteByIds([id]);

        return res.status(200).json(Presenters.presentSuccess(true));
      } catch (error) {
        return next(error);
      }
    }
  );

  rootRouter.use("/posts", router);
};
