import { resolveSection } from "#foundation/options/utils/resolveSection";
import { githubSchema } from "#tools/github/config/schemas/githubSchema";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { RawConfig } from "#project/config/types/RawConfig";
import type { ResolvedGithub } from "#tools/github/types/ResolvedGithub";

export function resolveGithub(
  raw: RawConfig,
  context: ConfigContext,
): ResolvedGithub {
  return resolveSection(githubSchema, raw.github, context, "github");
}
