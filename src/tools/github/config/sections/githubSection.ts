import { isString } from "@auaust/toolkit";
import { once } from "@auaust/toolkit/function";
import { freeze, mapValues } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { githubSchema } from "#tools/github/config/schemas/githubSchema";
import { defaultLabelColor } from "#tools/github/constants";
import type { ConfigResolver } from "#project/config/index";
import type { Label } from "#tools/github/types/Label";
import type { ResolvedGithub } from "#tools/github/types/ResolvedGithub";

export const githubSection = declareSection({
  declaration: githubSchema,
  async resolve(input, config: ConfigResolver): Promise<ResolvedGithub> {
    const [traits, { hasDependency }, packageJson] = await Promise.all([
      config.resolve("traits"),
      config.resolve("environment"),
      config.resolve("packageJson"),
    ]);

    const {
      repositories: configured,
      labels: declared,
      ...resolved
    } = githubSchema.resolve(
      input,
      {
        traits,
        hasDependency,
        repository: packageJson.optional.repository,
      },
      "github",
    );

    const labels = freeze(
      mapValues(declared, (label): Label => {
        return isString(label)
          ? freeze({ description: label, color: defaultLabelColor })
          : freeze({
              description: label.description,
              color: label.color ?? defaultLabelColor,
            });
      }),
    );

    const repositories = once(async () => {
      const [
        { optional },
        { resolveRegisteredRepositories },
      ] = await Promise.all([
        config.resolve("packageJson"),
        import("#tools/github/issues/api/index"),
      ]);

      return resolveRegisteredRepositories({
        root: config.context.root,
        name: optional.name,
        dependencies: optional.dependencies,
        configured,
      });
    });

    return freeze({
      ...resolved,
      labels,
      repositories,
      workflowsConfigured: input?.workflows !== undefined,
    });
  },
});
