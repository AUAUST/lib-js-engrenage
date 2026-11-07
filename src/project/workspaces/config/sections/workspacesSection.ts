import { declareSection, type Resolver } from "#foundation/options/index";
import { typescriptOptionsSection } from "#project/tsconfig/index";
import { workspacesSchema } from "#project/workspaces/config/schemas/workspacesSchema";
import { resolveWorkspaces } from "#project/workspaces/operations/resolveWorkspaces";
import type { ConfigContext } from "#project/config/index";

export const workspacesSection = declareSection({
  name: "workspaces",
  declaration: workspacesSchema,
  async resolve(input, config: Resolver<ConfigContext>) {
    const { root, filesystem } = config.context;

    const { files } = await config.resolve(typescriptOptionsSection);

    return resolveWorkspaces({
      root,
      filesystem,
      options: workspacesSchema.resolve(input, undefined, "workspaces"),
      typescriptFiles: files,
    });
  },
});
