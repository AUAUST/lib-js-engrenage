import { isNotEmpty } from "@auaust/primitive-kit/arrays";
import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { filesIn, findDirectories } from "#foundation/filesystem/index";
import { declareSection, type Resolver } from "#foundation/options/index";
import { resolveNodeRuntime } from "#project/baseline/index";
import { resolveEnvironmentRoles } from "#project/config/operations/resolveEnvironmentRoles";
import { resolveEnvironmentTsconfig } from "#project/config/operations/resolveEnvironmentTsconfig";
import { runtimeSection } from "#project/config/operations/runtimeSection";
import { toolingOptionsSection } from "#project/config/operations/toolingOptionsSection";
import { typescriptOptionsSection } from "#project/config/operations/typescriptOptionsSection";
import type { ConfigContext } from "#project/config/types/ConfigContext";

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
          roles: await resolveEnvironmentRoles(config, "tooling", option),
          tsconfig: await resolveEnvironmentTsconfig(config, "tooling"),
        },
        compose.getters({
          runtime: () => resolveNodeRuntime(node, "runtime.node"),
        }),
      ),
    );
  },
});
