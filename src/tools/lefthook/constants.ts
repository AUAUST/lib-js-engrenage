import { freeze } from "@auaust/toolkit/object";

import type { File } from "#types/File";

// @debt `lefthook.yml` is read and written at the project root, though in a monorepo sub-package it belongs at the git root
export const lefthookFile = "lefthook.yml" satisfies File;

export const gateCommandName = "engrenage";

// @debt the key still says "local" though the command runs every `everyone` gate step; renaming it needs sync to remove the old key from existing `lefthook.yml` files
export const everyoneCommandName = "engrenage-local";

export const gateHooks = freeze({
  "pre-commit": freeze({
    agents: "pnpm --silent engrenage gate --staged",
    everyone: "pnpm --silent engrenage gate --staged --everyone",
  }),
  "commit-msg": freeze({
    agents: "pnpm --silent engrenage gate --message {1}",
    everyone: "pnpm --silent engrenage gate --message {1} --everyone",
  }),
} as const);

export const installCommand = "lefthook install";
