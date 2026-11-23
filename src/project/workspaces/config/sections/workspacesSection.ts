import { flatMap, toDeduplicated } from "@auaust/toolkit/array";

import { withExtensions } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { listLanguageFiles } from "#project/environments/index";
import { workspaceEntryStem } from "#project/workspaces/constants";
import { resolveWorkspaces } from "#project/workspaces/operations/resolveWorkspaces";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedWorkspaceGroup } from "#project/workspaces/types/ResolvedWorkspaceGroup";

export const workspacesSection = declareSection({
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<readonly ResolvedWorkspaceGroup[]> {
    const { root, filesystem } = config.context;

    const [options, context, kinds, languages] = await Promise.all([
      config.resolve("workspaces.options"),
      config.resolve("structure.context"),
      config.context.registry.contributions("environmentKinds", config),
      config.context.registry.contributions("languages", config),
    ]);

    const byName = new Map(languages.map(({ entry }) => [entry.name, entry]));

    const selected = toDeduplicated(
      flatMap(kinds, ({ entry }) => {
        return entry.languages ?? [];
      }),
    ).flatMap((name) => {
      const language = byName.get(name);

      return language === undefined ? [] : [language];
    });

    const extensions = flatMap(languages, ({ entry }) => {
      return entry.modules === true ? entry.extensions : [];
    });

    const { expected } = await context.discover();

    return resolveWorkspaces({
      root,
      filesystem,
      options,
      // @debt a workspace's globs take every kind's default languages, not its own environments' selections, until its environments resolve in its child resolver (#745)
      typescriptFiles: listLanguageFiles(selected),
      entryGlob: withExtensions(workspaceEntryStem, extensions),
      expected,
    });
  },
});
