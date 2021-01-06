import { Router } from "express";

import { error } from "./error";

export const getRootRouter = () => {
  const router = Router();

  error(router);

  return router;
};
