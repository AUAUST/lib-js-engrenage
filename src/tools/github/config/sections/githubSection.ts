import { freeze } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import { declareSection } from "#foundation/options/index";
import { githubSchema } from "#tools/github/config/schemas/githubSchema";
import { resolveRegisteredRepositories } from "#tools/github/issues/api/index";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedGithub } from "#tools/github/types/ResolvedGithub";

export const githubSection = declareSection({
  declaration: githubSchema,
  async resolve(input, config: ConfigResolver): Promise<ResolvedGithub> {
    const [traits, { hasDependency }] = await Promise.all([
      config.resolve("traits"),
      config.resolve("environment"),
    ]);

    const {
      repositories: configured,
      ...resolved
    } = githubSchema.resolve(input, { traits, hasDependency }, "github");

    const repositories = once(async () => {
      const { optional } = await config.resolve("packageJson");

      return resolveRegisteredRepositories({
        root: config.context.root,
        name: optional.name,
        dependencies: optional.dependencies,
        configured,
      });
    });

    return freeze({
      ...resolved,
      repositories,
      workflowsConfigured: input?.workflows !== undefined,
    });
  },
});
