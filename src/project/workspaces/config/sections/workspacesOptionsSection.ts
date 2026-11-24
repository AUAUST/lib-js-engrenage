import { entries, keys } from "@auaust/toolkit/object";

import { declareSection, type OutputOf } from "#foundation/options/index";
import {
  checkScopeInputs,
  listInputScopes,
  type ConfigResolver,
} from "#project/config/index";
import { workspaceSchema } from "#project/workspaces/config/schemas/workspaceSchema";
import { workspacesSchema } from "#project/workspaces/config/schemas/workspacesSchema";

export const workspacesOptionsSection = declareSection({
  declaration: workspacesSchema,
  resolve(input, config: ConfigResolver): OutputOf<typeof workspacesSchema> {
    const scopes = listInputScopes(config.context.registry);

    const fields = keys(workspaceSchema.entries);

    for (const [glob, entry] of entries(input ?? {})) {
      checkScopeInputs(scopes, entry, `workspaces "${glob}"`, fields);
    }

    return workspacesSchema.resolve(
      input,
      { reporter: config.context.reporter },
      "workspaces",
    );
  },
});
