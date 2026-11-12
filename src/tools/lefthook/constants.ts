import type { File } from "#types/File";

// @debt `lefthook.yml` is read and written at the project root, though in a monorepo sub-package it belongs at the git root
export const lefthookFile = "lefthook.yml" satisfies File;

export const gateCommandName = "engrenage";

export const gateCommand = "pnpm --silent engrenage gate --staged";

// @debt the key still says "local" though the command runs every `everyone` gate step; renaming it needs sync to remove the old key from existing `lefthook.yml` files
export const everyoneCommandName = "engrenage-local";

export const everyoneGateCommand = "pnpm --silent engrenage gate --staged --everyone";

export const hookName = "pre-commit";

export const messageGateCommand = "pnpm --silent engrenage gate --message {1}";

export const messageHookName = "commit-msg";

export const installCommand = "lefthook install";
