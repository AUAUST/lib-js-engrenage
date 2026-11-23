import { declareSection, type OutputOf } from "#foundation/options/index";
import { workspacesSchema } from "#project/workspaces/config/schemas/workspacesSchema";
import type { ConfigResolver } from "#project/config/index";

export const workspacesOptionsSection = declareSection({
  declaration: workspacesSchema,
  resolve(input, config: ConfigResolver): OutputOf<typeof workspacesSchema> {
    return workspacesSchema.resolve(
      input,
      { reporter: config.context.reporter },
      "workspaces",
    );
  },
});
