import type { ProjectConfig } from "#project/config/index";
import type { ResolvedAgents } from "#tools/agents/index";
import type { ResolvedGit } from "#tools/git/index";
import type { ResolvedGithub } from "#tools/github/index";
import type { ResolvedPrettier } from "#tools/prettier/index";
import type { ResolvedVscode } from "#tools/vscode/index";

export interface Config extends ProjectConfig {
  readonly agents: ResolvedAgents;
  readonly git: ResolvedGit;
  readonly github: ResolvedGithub;
  readonly prettier: ResolvedPrettier;
  readonly vscode: ResolvedVscode;
}
