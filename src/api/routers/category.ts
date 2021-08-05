import { Router } from "express";
import { body, param, query } from "express-validator";

import { validateParameters } from "../middlewares/validateParameters";

import { Category } from "../../database/entities/category";
import { Post } from "../../database/entities/post";

import * as Presenters from "../presenters";

export const applyCategoryRouters = (rootRouter: Router) => {
  const router = Router();

  router.post(
    "/",
    body("name").isString().withMessage("name must be string").exists().withMessage("name must be provided"),
    body("parentId").isString().withMessage("parentId must be string").optional(),
    validateParameters,
    async (req, res, next) => {
      try {
        const name = req.body.name as string;
        const parentId = req.body.parentId as string | undefined;

        const category = await Category.create({ name, parentId });

        return res.status(201).json(Presenters.presentCategory({ category }));
      } catch (error) {
        return next(error);
      }
    }
  );

  router.put(
    "/:id",
    param("id").isString().withMessage("id must be string"),
    body("name").isString().withMessage("name must be string").exists().withMessage("name must be provided"),
    body("parentId").isString().withMessage("parentId must be string").optional(),
    validateParameters,
    async (req, res, next) => {
      try {
        const id = req.params.id as string;
        const name = req.body.name as string;
        const parentId = req.body.parentId as string | undefined;

        const editedCategory = await Category.update({ id, name, parentId });

        return res.status(200).json(Presenters.presentCategory({ category: editedCategory }));
      } catch (error) {
        return next(error);
      }
    }
  );

  router.get("/", async (req, res, next) => {
    try {
      const categories = await Category.findAll();

      return res.status(200).json(Presenters.presentAllCategories({ categories }));
    } catch (error) {
      return next(error);
    }
  });

  router.get(
    "/:id/posts",
    param("id").isString().withMessage("id must be string"),
    query("count").isNumeric().withMessage("count must be number").exists(),
    query("cursor").isNumeric().withMessage("cursor must be number").optional(),
    validateParameters,
    async (req, res, next) => {
      try {
        const categoryId = req.params.id as string;
        const count = Number(req.query.count);
        const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

        const posts = await Post.findCategoryPostsByCursor({ categoryId, count, cursor });
        const nextCursor = posts.length === count ? posts[posts.length - 1].createdAt.valueOf() : null;

        return res.status(200).json(Presenters.presentPostList({ posts, nextCursor }));
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

        await Category.deleteByIds([id]);

        return res.status(200).json(Presenters.presentSuccess(true));
      } catch (error) {
        return next(error);
      }
    }
  );

  rootRouter.use("/categories", router);
};
