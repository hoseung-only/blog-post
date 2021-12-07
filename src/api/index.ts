import { Router } from "express";

import { applyPostRouters } from "./routers/post";
import { applyCategoryRouters } from "./routers/category";
import { applySearchRouters } from "./routers/search";
import { applyErrorHandlers } from "./errorHandlers";

export const getRootRouter = () => {
  const router = Router();

  applyPostRouters(router);
  applyCategoryRouters(router);
  applySearchRouters(router);
  applyErrorHandlers(router);

  return router;
};
