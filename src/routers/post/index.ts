import { Router } from "express";
import { param } from "express-validator";

import { validateParameters } from "../middlewares/validateParameters";

const mockPosts: { [key in number]: { title: string; content: string } } = {
  1: {
    title: "first post",
    content: "hello",
  },
  2: {
    title: "second post",
    content: "world",
  },
};

export const post = (rootRouter: Router) => {
  const router = Router();

  router.get(
    "/:id",
    param("id").isNumeric(),
    validateParameters,
    async (req, res, next) => {
      const id = Number(req.params.id);

      if (!mockPosts[id]) {
        return next(new Error(`post of id ${id} is not exist`));
      }

      return res.status(200).json({
        data: mockPosts[id],
      });
    }
  );

  rootRouter.use("/post", router);
};
