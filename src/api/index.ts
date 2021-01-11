import { Router } from "express";

import { applyPostRouters } from "./routers/post";
import { applyCategoryRouters } from "./routers/category";
import { applyErrorHandlers } from "./errorHandlers";

export const getRootRouter = () => {
  const router = Router();

  applyPostRouters(router);
  applyCategoryRouters(router);
  applyErrorHandlers(router);

  return router;
};
