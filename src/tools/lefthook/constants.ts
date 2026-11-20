import { freeze } from "@auaust/toolkit/object";

import type { File } from "#types/File";

// @debt `lefthook.yml` is read and written at the project root, though in a monorepo sub-package it belongs at the git root
export const lefthookFile = "lefthook.yml" satisfies File;

export const gateCommandName = "engrenage";

// @debt the key still says "local" though the command runs every `everyone` gate step; renaming it needs sync to remove the old key from existing `lefthook.yml` files
export const everyoneCommandName = "engrenage-local";

// @debt hooks skip pnpm's install check because a merge, checkout or `changeset version` changes the manifests before anyone can reinstall; the gate then runs on the previous install, so dependency changes the operation brings go unchecked until the next install
const gateRun = "pnpm --silent --config.verify-deps-before-run=false engrenage gate";

export const gateHooks = freeze({
  "pre-commit": freeze({
    agents: `${gateRun} --staged`,
    everyone: `${gateRun} --staged --everyone`,
  }),
  "commit-msg": freeze({
    agents: `${gateRun} --message "{1}"`,
    everyone: `${gateRun} --message "{1}" --everyone`,
  }),
} as const);

export const installCommand = "lefthook install";
