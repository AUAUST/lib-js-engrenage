import { declareSection, type Resolver } from "#foundation/options/index";
import { buildSchema } from "#project/build/config/schemas/buildSchema";
import { tsconfigSection } from "#project/tsconfig/index";
import type { ConfigContext } from "#project/config/index";
import type { Directory } from "#types/Directory";

// @debt declared under `build` to read its input, so it shares the name of `buildSection` and a cycle message can show the name twice
export const buildOutDirSection = declareSection({
  name: "build",
  declaration: buildSchema,
  resolve(
    input,
    config: Resolver<ConfigContext>,
  ): Promise<Directory | undefined> {
    return buildSchema.entries.outDir.resolve(
      input?.outDir,
      {
        root: config.context.root,
        tsconfig() {
          return config.resolve(tsconfigSection);
        },
      },
      "build.outDir",
    );
  },
});
