import { isNotEmpty } from "@auaust/primitive-kit/arrays";
import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { filesIn, findDirectories } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { resolveNodeRuntime } from "#project/baseline/index";
import { resolveEnvironmentTsconfig } from "#project/environments/operations/resolveEnvironmentTsconfig";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedTooling } from "#project/environments/types/ResolvedTooling";

export const toolingSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedTooling> {
    const { node } = await config.resolve("runtime");

    const option = await config.resolve("tooling.options");

    const typescript = await config.resolve("typescript.options");

    const { files } = option;
    const walked = option.dirs.filter((directory) => directory !== ".");
    const rootFiles = walked.length === option.dirs.length ? [] : files;

    return freeze(
      compose(
        {
          active: isNotEmpty(
            await findDirectories(config.context.filesystem, option.dirs),
          ),
          dirs: walked,
          files: rootFiles,
          defines: false,
          globs: [...rootFiles, ...filesIn(walked, typescript.files)],
          tsconfig: await resolveEnvironmentTsconfig(config, "tooling"),
        },
        compose.getters({
          runtime: () => resolveNodeRuntime(node, "runtime.node"),
        }),
      ),
    );
  },
});
