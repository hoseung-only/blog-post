import { Router } from "express";

import { post } from "./post";
import { error } from "./error";

export const getRootRouter = () => {
  const router = Router();

  post(router);
  error(router);

  return router;
};
