import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { githubSchema } from "#tools/github/config/schemas/githubSchema";
import { resolveRegisteredRepositories } from "#tools/github/issues/api/index";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedGithub } from "#tools/github/types/ResolvedGithub";

export const githubSection = declareSection({
  declaration: githubSchema,
  async resolve(input, config: ConfigResolver): Promise<ResolvedGithub> {
    const [traits, { hasDependency }, { optional }] = await Promise.all([
      config.resolve("traits"),
      config.resolve("environment"),
      config.resolve("packageJson"),
    ]);

    const resolved = githubSchema.resolve(
      input,
      { traits, hasDependency },
      "github",
    );

    const repositories = await resolveRegisteredRepositories({
      root: config.context.root,
      name: optional.name,
      dependencies: optional.dependencies,
      configured: resolved.repositories,
    });

    return freeze({
      ...resolved,
      repositories,
      workflowsConfigured: input?.workflows !== undefined,
    });
  },
});
