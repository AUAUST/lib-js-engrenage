import { isNotEmpty } from "@auaust/primitive-kit/arrays";
import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { filesIn, findDirectories } from "#foundation/filesystem/index";
import { declareSection, type Resolver } from "#foundation/options/index";
import { resolveNodeRuntime } from "#project/baseline/index";
import { runtimeSection } from "#project/environments/config/sections/runtimeSection";
import { toolingOptionsSection } from "#project/environments/config/sections/toolingOptionsSection";
import { resolveEnvironmentTsconfig } from "#project/environments/operations/resolveEnvironmentTsconfig";
import { typescriptOptionsSection } from "#project/tsconfig/index";
import type { ConfigContext } from "#project/config/index";

export const toolingSection = declareSection({
  name: "tooling",
  async resolve(_input, config: Resolver<ConfigContext>) {
    const { node } = await config.resolve(runtimeSection);

    const option = await config.resolve(toolingOptionsSection);

    const typescript = await config.resolve(typescriptOptionsSection);

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
