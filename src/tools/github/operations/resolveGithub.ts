import { resolveSection } from "#foundation/options/index";
import { githubSchema } from "#tools/github/config/schemas/githubSchema";
import type { RawConfig } from "#project/config/index";
import type { ResolvedGithub } from "#tools/github/types/ResolvedGithub";

export function resolveGithub(raw: RawConfig): ResolvedGithub {
  return resolveSection(githubSchema, raw.github, undefined, "github");
}
