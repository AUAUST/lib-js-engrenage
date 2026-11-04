import { freeze } from "@auaust/toolkit/object";

import { engrenage } from "#constants";
import type { HookDefinition } from "#tools/agents/types/HookDefinition";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export const codexFile = "AGENTS.override.md" satisfies File;

export const codexTemplate = `${engrenage}/agents/templates/${codexFile}`;

export const codexHooksFile = ".codex/hooks.json" satisfies File;

export const codexEditHook = freeze({
  event: "PostToolUse",
  matcher: "^apply_patch$",
  command: "pnpm --silent engrenage agents codex hook edit",
} as const) satisfies HookDefinition;

export const codexGithubHook = freeze({
  event: "PreToolUse",
  matcher: "^Bash$",
  command: "pnpm --silent engrenage agents codex hook github",
} as const) satisfies HookDefinition;

export const codexSkillsDir = ".agents/skills" satisfies Directory;
