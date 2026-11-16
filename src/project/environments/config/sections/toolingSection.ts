import { isNotEmpty } from "@auaust/primitive-kit/arrays";
import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { filesIn, findDirectories } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { resolveNodeRuntime } from "#project/baseline/index";
import { resolveEnvironmentDirs } from "#project/environments/operations/resolveEnvironmentDirs";
import { resolveEnvironmentTsconfig } from "#project/environments/operations/resolveEnvironmentTsconfig";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedTooling } from "#project/environments/types/ResolvedTooling";

export const toolingSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedTooling> {
    const { node } = await config.resolve("runtime");

    const option = await config.resolve("tooling.options");

    const typescript = await config.resolve("typescript.options");

    const dirs = await resolveEnvironmentDirs(config, "tooling", option.dirs);

    const { files } = option;
    const walked = dirs.filter((directory) => directory !== ".");
    const rootFiles = walked.length === dirs.length ? [] : files;

    const { filesystem } = config.context;

    const existing = await findDirectories(filesystem, walked);

    const matched = isNotEmpty(rootFiles)
      ? await filesystem.glob(rootFiles)
      : [];

    return freeze(
      compose(
        {
          active: isNotEmpty(existing) || isNotEmpty(matched),
          dirs: walked,
          rootFiles,
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
