import { strictObject } from "valibot";

import { guardOutDirSchema } from "#vitest/config/schemas/guardOutDirSchema";

export const optionsSchema = strictObject({
  guardOutDir: guardOutDirSchema,
});
