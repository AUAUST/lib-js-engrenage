import { freeze } from "@auaust/toolkit/object";

import {
  discoverWorkspaces,
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
    readonly diagnostics: readonly StructureDiagnostic[];
    readonly ignored: Globs;
  }> {
    const repository = await config.resolve("git");

    const ignored = await repository.ignored;

    const { workspaces, diagnostics } = await discoverWorkspaces({
      filesystem: config.context.filesystem,
      ignored,
    });

    return freeze({
      workspaces,
      diagnostics,
      ignored,
    });
  },
});
