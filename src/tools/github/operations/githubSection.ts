import { declareSection } from "#foundation/options/index";
import { githubSchema } from "#tools/github/config/schemas/githubSchema";
import type { ResolvedGithub } from "#tools/github/types/ResolvedGithub";

export const githubSection = declareSection({
  name: "github",
  declaration: githubSchema,
  resolve(input): ResolvedGithub {
    return githubSchema.resolve(input, undefined, "github");
  },
});
