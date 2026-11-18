import { mkdirSync, readdirSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { isString } from "@auaust/toolkit";
import { entries, record } from "@auaust/toolkit/object";

import manifest from "#package.json" with { type: "json" };

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));

const unlinkedEntries: ReadonlySet<string> = new Set([".git", "package.json"]);

// @debt exports are rewritten to their `source` targets instead of linking the package unchanged and running with `--conditions=source`, since Prettier and Vite resolve config imports with fixed conditions
// @debt Every other repository root entry is linked, `node_modules`, `dist` and agent files included, instead of only what the package publishes and its source mode needs.
export function linkSourcePackage(target: string) {
  mkdirSync(target, {
    recursive: true,
  });

  for (const entry of readdirSync(repositoryRoot)) {
    if (!unlinkedEntries.has(entry)) {
      symlinkSync(join(repositoryRoot, entry), join(target, entry));
    }
  }

  const exports = record(
    entries(manifest.exports).map(([path, target]) => {
      return [path, isString(target) ? target : target.source];
    }),
  );

  writeFileSync(
    join(target, "package.json"),
    JSON.stringify({
      ...manifest,
      exports,
    }),
  );
}
