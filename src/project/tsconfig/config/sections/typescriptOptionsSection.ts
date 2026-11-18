import { basename } from "node:path";

import { tsconfigFile } from "#constants";
import { declareSection, type OutputOf } from "#foundation/options/index";
import { typescriptSchema } from "#project/tsconfig/config/schemas/typescriptSchema";
import type { ConfigResolver } from "#project/config/index";

export const typescriptOptionsSection = declareSection({
  declaration: typescriptSchema,
  resolve(input, config: ConfigResolver): OutputOf<typeof typescriptSchema> {
    const { reporter } = config.context;

    const options = typescriptSchema.resolve(input, { reporter }, "typescript");

    const { file } = options.tsconfig.path;

    if (basename(file) !== tsconfigFile) {
      reporter.warn(
        `The base tsconfig ${file} is not named ${tsconfigFile}, the only name editors and typed lint discover`,
      );
    }

    return options;
  },
});
