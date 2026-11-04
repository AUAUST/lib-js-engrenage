import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { ResolvedGit } from "#tools/git/types/ResolvedGit";
import type { ResolvedGithub } from "#tools/github/types/ResolvedGithub";
import type { ResolvedPrettier } from "#tools/prettier/types/ResolvedPrettier";
import type { ResolvedVscode } from "#tools/vscode/types/ResolvedVscode";

export interface Config extends ProjectConfig {
  readonly agents: ResolvedAgents;
  readonly git: ResolvedGit;
  readonly github: ResolvedGithub;
  readonly prettier: ResolvedPrettier;
  readonly vscode: ResolvedVscode;
}
