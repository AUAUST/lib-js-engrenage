import type { File } from "#types/File";

// @debt `lefthook.yml` is read and written at the project root, though in a monorepo sub-package it belongs at the git root
export const lefthookFile = "lefthook.yml" satisfies File;

export const gateCommandName = "engrenage";

export const gateCommand = "pnpm --silent engrenage gate --staged";

export const hookName = "pre-commit";

export const installCommand = "lefthook install";
