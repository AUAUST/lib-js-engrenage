import { declareSection } from "#foundation/options/index";
import { buildSchema } from "#project/build/config/schemas/buildSchema";
import type { ConfigResolver } from "#project/config/index";
import type { Directory } from "#types/Directory";

export const buildOutDirSection = declareSection({
  name: "build",
  declaration: buildSchema,
  resolve(input, config: ConfigResolver): Promise<Directory | undefined> {
    return buildSchema.entries.outDir.resolve(
      input?.outDir,
      {
        root: config.context.root,
        tsconfig() {
          return config.resolve("tsconfig");
        },
      },
      "build.outDir",
    );
  },
});
