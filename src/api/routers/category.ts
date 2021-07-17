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
    body("parentId").isNumeric().withMessage("parentId must be number").optional(),
    validateParameters,
    async (req, res, next) => {
      try {
        const name = req.body.name as string;
        const parentId = req.body.parentId as number | undefined;

        const category = await Category.create({ name, parentId });

        return res.status(201).json(Presenters.presentCategory({ category }));
      } catch (error) {
        return next(error);
      }
    }
  );

  router.put(
    "/:id",
    param("id").isNumeric().withMessage("id must be number"),
    body("name").isString().withMessage("name must be string").exists().withMessage("name must be provided"),
    body("parentId").isNumeric().withMessage("parentId must be number").optional(),
    validateParameters,
    async (req, res, next) => {
      try {
        const id = Number(req.params.id);
        const name = req.body.name as string;
        const parentId = req.body.parentId as number | undefined;

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
    param("id").isNumeric().withMessage("id must be number"),
    query("cursor").isNumeric().withMessage("cursor must be number").optional(),
    validateParameters,
    async (req, res, next) => {
      try {
        const cursor = req.query.cursor ? Number(req.query.cursor) : 0;
        const categoryId = Number(req.params.id);

        const posts = await Post.findCategoryPostsByCursor(cursor, categoryId);
        const nextCursor = posts.length === 10 ? posts[posts.length - 1].id + 1 : null;

        return res.status(200).json(Presenters.presentPostList({ posts, nextCursor }));
      } catch (error) {
        return next(error);
      }
    }
  );

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
