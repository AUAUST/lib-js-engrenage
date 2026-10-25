import { codeFilesSchema } from "#config/config/schemas/codeFilesSchema";
import { configFilesSchema } from "#config/config/schemas/configFilesSchema";
import { discoveredFilesSchema } from "#config/config/schemas/discoveredFilesSchema";
import { generatedFilesSchema } from "#config/config/schemas/generatedFilesSchema";
import { gitignoreFileSchema } from "#config/config/schemas/gitignoreFileSchema";
import { testFilesSchema } from "#config/config/schemas/testFilesSchema";
import { optional, strictObject } from "valibot";

export const filesSchema = optional(
  strictObject({
    code: codeFilesSchema,
    test: testFilesSchema,
    config: configFilesSchema,
    discovered: discoveredFilesSchema,
    generated: generatedFilesSchema,
    gitignore: gitignoreFileSchema,
  }),
  {},
);
