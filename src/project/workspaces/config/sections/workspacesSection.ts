import { declareSection } from "#foundation/options/index";
import { workspacesSchema } from "#project/workspaces/config/schemas/workspacesSchema";
import { resolveWorkspaces } from "#project/workspaces/operations/resolveWorkspaces";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedWorkspaceGroup } from "#project/workspaces/types/ResolvedWorkspaceGroup";

export const workspacesSection = declareSection({
  name: "workspaces",
  declaration: workspacesSchema,
  async resolve(
    input,
    config: ConfigResolver,
  ): Promise<readonly ResolvedWorkspaceGroup[]> {
    const { root, filesystem } = config.context;

    const { files } = await config.resolve("typescript.options");

    return resolveWorkspaces({
      root,
      filesystem,
      options: workspacesSchema.resolve(input, undefined, "workspaces"),
      typescriptFiles: files,
    });
  },
});
