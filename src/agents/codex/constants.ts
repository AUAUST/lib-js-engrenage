import { freeze } from "@auaust/toolkit/object";

import { engrenage } from "#constants";
import type { File } from "#types/File";

export const codexFile = "AGENTS.override.md" satisfies File;

export const codexTemplate = `${engrenage}/agents/templates/${codexFile}`;

export const codexHooksFile = ".codex/hooks.json" satisfies File;

export const codexEditHookCommand =
  "pnpm --silent engrenage agents codex hook edit";

export const codexEditHook = freeze({
  matcher: "^apply_patch$",
  hooks: [
    {
      type: "command",
      command: codexEditHookCommand,
    },
  ],
} as const);
