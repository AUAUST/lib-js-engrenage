import { flatMap } from "@auaust/primitive-kit/arrays";

import { withExtensions } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { workspacesSchema } from "#project/workspaces/config/schemas/workspacesSchema";
import { workspaceEntryStem } from "#project/workspaces/constants";
import { resolveWorkspaces } from "#project/workspaces/operations/resolveWorkspaces";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedWorkspaceGroup } from "#project/workspaces/types/ResolvedWorkspaceGroup";

export const workspacesSection = declareSection({
  declaration: workspacesSchema,
  async resolve(
    input,
    config: ConfigResolver,
  ): Promise<readonly ResolvedWorkspaceGroup[]> {
    const { root, filesystem } = config.context;

    const { files } = await config.resolve("typescript.options");

    const languages = await config.context.registry.contributions(
      "languages",
      config,
    );

    const extensions = flatMap(languages, ({ entry }) => {
      return entry.modules === true ? entry.extensions : [];
    });

    return resolveWorkspaces({
      root,
      filesystem,
      options: workspacesSchema.resolve(input, undefined, "workspaces"),
      typescriptFiles: files,
      entryGlob: withExtensions(workspaceEntryStem, extensions),
    });
  },
});
