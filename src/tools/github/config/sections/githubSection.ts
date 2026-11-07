import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { environmentSection } from "#project/package/index";
import { traitsSection } from "#project/presets/index";
import { githubSchema } from "#tools/github/config/schemas/githubSchema";
import type { ResolvedGithub } from "#tools/github/types/ResolvedGithub";

export const githubSection = declareSection({
  name: "github",
  declaration: githubSchema,
  async resolve(input, config): Promise<ResolvedGithub> {
    const [traits, { hasDependency }] = await Promise.all([
      config.resolve(traitsSection),
      config.resolve(environmentSection),
    ]);

    return freeze({
      ...githubSchema.resolve(input, { traits, hasDependency }, "github"),
      workflowsConfigured: input?.workflows !== undefined,
    });
  },
});
