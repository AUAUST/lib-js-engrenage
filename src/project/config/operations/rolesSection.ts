import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { traitsSection } from "#project/config/operations/traitsSection";
import { typescriptOptionsSection } from "#project/config/operations/typescriptOptionsSection";
import {
  normalizeRoles,
  rolesSchema,
  type ProjectRoles,
} from "#project/structure/index";

export const rolesSection = declareSection({
  name: "roles",
  declaration: rolesSchema,
  async resolve(input, config): Promise<ProjectRoles> {
    const declared = rolesSchema.resolve(input, undefined, "roles");

    const traits = await config.resolve(traitsSection);
    const typescript = await config.resolve(typescriptOptionsSection);

    return freeze({
      ...normalizeRoles(declared),
      enabled: declared.enabled,
      verbatimModuleSyntax: typescript.verbatimModuleSyntax,
      published: traits.published,
    });
  },
});
