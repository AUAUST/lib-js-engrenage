import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import type { DiscoveredEnvironment } from "#batiment/environments/index";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { DiscoveredWorkspace } from "#batiment/scopes/index";
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
    const context = await config.resolve("structure.context");

    const {
      workspaces,
      metafiles,
      diagnostics,
      ignored,
    } = await context.discover();

    return freeze({
      workspaces,
      environments: metafiles,
      diagnostics,
      ignored,
    });
  },
});
