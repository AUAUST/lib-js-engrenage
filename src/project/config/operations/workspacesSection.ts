import { declareSection, type Resolver } from "#foundation/options/index";
import { typescriptOptionsSection } from "#project/config/operations/typescriptOptionsSection";
import { resolveWorkspaces, workspacesSchema } from "#project/workspaces/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";

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
