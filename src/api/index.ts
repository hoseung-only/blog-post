import { Router } from "express";

import { applyPostRouters } from "./routers/post";
import { applyErrorHandlers } from "./errorHandlers";

export const getRootRouter = () => {
  const router = Router();

  applyPostRouters(router);
  applyErrorHandlers(router);

  return router;
};
