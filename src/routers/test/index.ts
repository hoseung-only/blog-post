import { Router, RequestHandler } from "express";

export const applyTestHandlers = (rootRouter: Router) => {
  const router = Router();

  const test: RequestHandler = (req, res, next) => {
    return res.status(200).json({
      message: "test",
    });
  };

  const error: RequestHandler = (req, res, next) => {
    const err = new Error();
    return next(err);
  };

  router.get("/", test);
  router.get("/error", error);

  rootRouter.use("/test", router);
};
