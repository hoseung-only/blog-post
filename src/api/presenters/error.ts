import * as Entities from "../entities";

export function presentError(message: string | string[]): Entities.Error {
  return { message };
}
