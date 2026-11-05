import { resolveSection } from "#foundation/options/index";
import { githubSchema } from "#tools/github/config/schemas/githubSchema";
import type { ConfigContext, RawConfig } from "#project/config/index";
import type { ResolvedGithub } from "#tools/github/types/ResolvedGithub";

export function resolveGithub(
  raw: RawConfig,
  context: ConfigContext,
): ResolvedGithub {
  return resolveSection(githubSchema, raw.github, context, "github");
}
