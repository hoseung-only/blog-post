import * as Entities from "../entities";

export function presentError(message: string | string[]): Entities.ErrorShow {
  return { message };
}
