import { codeFilesSchema } from "#config/config/schemas/codeFilesSchema";
import { configFilesSchema } from "#config/config/schemas/configFilesSchema";
import { discoveredFilesSchema } from "#config/config/schemas/discoveredFilesSchema";
import { fixtureFilesSchema } from "#config/config/schemas/fixtureFilesSchema";
import { generatedFilesSchema } from "#config/config/schemas/generatedFilesSchema";
import { gitignoreFileSchema } from "#config/config/schemas/gitignoreFileSchema";
import { testFilesSchema } from "#config/config/schemas/testFilesSchema";
import { tsconfigFileSchema } from "#config/config/schemas/tsconfigFileSchema";
import { optional, strictObject } from "valibot";

export const filesSchema = optional(
  strictObject({
    code: codeFilesSchema,
    test: testFilesSchema,
    fixtures: fixtureFilesSchema,
    config: configFilesSchema,
    discovered: discoveredFilesSchema,
    generated: generatedFilesSchema,
    gitignore: gitignoreFileSchema,
    tsconfig: tsconfigFileSchema,
  }),
  {},
);
