import { Router } from "express";

import { applyErrorHandlers } from "./error";

export const getRootRouter = () => {
  const router = Router();

  applyErrorHandlers(router);

  return router;
};
