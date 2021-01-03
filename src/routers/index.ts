import { Router } from "express";

import { applyTestHandlers } from "./test";
import { applyErrorHandlers } from "./error";

export const getRootRouter = () => {
  const router = Router();

  applyTestHandlers(router);
  applyErrorHandlers(router);

  return router;
};
