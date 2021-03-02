import * as Entities from "../entities";

export function presentSuccess(success: boolean): Entities.SuccessShow {
  return { success };
}
