import { Router } from "express";

import { applyTestRouters } from "./routers/test";
import { applyPostRouters } from "./routers/post";
import { applyCategoryRouters } from "./routers/category";
import { applyErrorHandlers } from "./errorHandlers";

export const getRootRouter = () => {
  const router = Router();

  applyTestRouters(router);
  applyPostRouters(router);
  applyCategoryRouters(router);
  applyErrorHandlers(router);

  return router;
};
