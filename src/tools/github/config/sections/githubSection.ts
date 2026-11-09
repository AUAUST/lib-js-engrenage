import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { githubSchema } from "#tools/github/config/schemas/githubSchema";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedGithub } from "#tools/github/types/ResolvedGithub";

export const githubSection = declareSection({
  declaration: githubSchema,
  async resolve(input, config: ConfigResolver): Promise<ResolvedGithub> {
    const [traits, { hasDependency }] = await Promise.all([
      config.resolve("traits"),
      config.resolve("environment"),
    ]);

    return freeze({
      ...githubSchema.resolve(input, { traits, hasDependency }, "github"),
      workflowsConfigured: input?.workflows !== undefined,
    });
  },
});
