import { freeze } from "@auaust/toolkit/object";

import {
  discoverWorkspaces,
  type DiscoveredEnvironment,
  type DiscoveredWorkspace,
} from "#batiment/scopes/index";
import { declareSection } from "#foundation/options/index";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { ConfigResolver } from "#project/config/index";
import type { Globs } from "#types/Globs";

export const discoverySection = declareSection({
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<{
    readonly workspaces: readonly DiscoveredWorkspace[];
    readonly environments: readonly DiscoveredEnvironment[];
    readonly diagnostics: readonly StructureDiagnostic[];
    readonly ignored: Globs;
  }> {
    const [repository, kinds] = await Promise.all([
      config.resolve("git"),
      config.context.registry.contributions("environmentKinds", config),
    ]);

    const ignored = await repository.ignored;

    const { workspaces, environments, diagnostics } = await discoverWorkspaces({
      filesystem: config.context.filesystem,
      ignored,
      kinds: kinds.map(({ entry }) => entry.name),
    });

    return freeze({
      workspaces,
      environments,
      diagnostics,
      ignored,
    });
  },
});
