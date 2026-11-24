import { flatMap } from "@auaust/toolkit/array";

import { withExtensions } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import {
  listLanguageFiles,
  readSelectedLanguages,
} from "#project/environments/index";
import { workspaceEntryStem } from "#project/workspaces/constants";
import { listScopeConfigs } from "#project/workspaces/operations/listScopeConfigs";
import { resolveWorkspaces } from "#project/workspaces/operations/resolveWorkspaces";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedWorkspaceGroup } from "#project/workspaces/types/ResolvedWorkspaceGroup";

export const workspacesSection = declareSection({
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<readonly ResolvedWorkspaceGroup[]> {
    const { root, filesystem } = config.context;

    const [options, context, selected, languages] = await Promise.all([
      config.resolve("workspaces.options"),
      config.resolve("structure.context"),
      readSelectedLanguages(config),
      config.context.registry.contributions("languages", config),
    ]);

    const extensions = flatMap(languages, ({ entry }) => {
      return entry.modules === true ? entry.extensions : [];
    });

    const modules = selected.filter((language) => language.modules === true);

    const [
      { expected },
      configs,
    ] = await Promise.all([context.discover(), listScopeConfigs(config)]);

    const names = await Promise.all(
      configs.map(async (scoped) => {
        return [scoped.context.scopeDir, await scoped.resolve("name")] as const;
      }),
    );

    return resolveWorkspaces({
      root,
      names: new Map(
        names.flatMap(([dir, name]) => {
          return name === undefined ? [] : [[dir, name] as const];
        }),
      ),
      filesystem,
      options,
      // @debt a workspace's globs take every registered environment's languages, not its own environments' selections, until its environments resolve in its child resolver (#745)
      typescriptFiles: listLanguageFiles(modules),
      entryGlob: withExtensions(workspaceEntryStem, extensions),
      expected,
    });
  },
});
