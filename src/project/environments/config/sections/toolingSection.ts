import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { filesIn } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { resolveNodeRuntime } from "#project/baseline/index";
import { discoverDeclaredEnvironment } from "#project/environments/operations/discoverDeclaredEnvironment";
import { readEnvironmentLanguages } from "#project/environments/operations/readEnvironmentLanguages";
import { resolveEnvironmentTsconfig } from "#project/environments/operations/resolveEnvironmentTsconfig";
import { listLanguageFiles } from "#project/environments/utils/listLanguageFiles";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedTooling } from "#project/environments/types/ResolvedTooling";

export const toolingSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedTooling> {
    const { node } = await config.resolve("runtime");

    const option = await config.resolve("tooling.options");

    const languages = await readEnvironmentLanguages(config, "tooling");

    const {
      dirs,
      rootFiles,
      active,
    } = await discoverDeclaredEnvironment(config, "tooling");

    return freeze(
      compose(
        {
          active,
          dirs,
          rootFiles,
          globs: [...rootFiles, ...filesIn(dirs, listLanguageFiles(languages))],
          tsconfig: await resolveEnvironmentTsconfig(config, "tooling"),
        },
        compose.getters({
          runtime: () => resolveNodeRuntime(node, "runtime.node"),
        }),
      ),
    );
  },
});
