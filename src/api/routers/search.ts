import { Router } from "express";
import { query } from "express-validator";

import { ErrorResponse } from "../../utils/error";

import { validateParameters } from "../middlewares/validateParameters";

import { Post } from "../../database/mysql/post";

import * as Presenters from "../presenters";

export const applySearchRouters = (rootRouter: Router) => {
  const router = Router();

  router.get(
    "/posts",
    query("query").exists().withMessage("query must be passed"),
    query("count").isNumeric().withMessage("count must be number").exists().withMessage("count must be provided"),
    query("cursor").isNumeric().withMessage("cursor must be number").optional(),
    validateParameters,
    async (req, res, next) => {
      try {
        const query = decodeURIComponent(req.query.query as string);
        const count = Number(req.query.count);
        const cursor = req.query.cursor ? Number(req.query.cursor) : 0;

        const posts = await Post.search({ query, count, cursor });
        const nextCursor = posts.length === count ? posts[posts.length - 1].createdAt.valueOf() : null;

        return res.status(200).json(Presenters.presentPostList({ posts, nextCursor }));
      } catch (error) {
        console.log(error);
        return next(error);
      }
    }
  );

  rootRouter.use("/search", router);
};
