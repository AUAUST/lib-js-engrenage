import {
  mkdirSync,
  readdirSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { entries, record } from "@auaust/toolkit/object";

import manifest from "#package.json" with { type: "json" };

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));

const { paths } = JSON.parse(
  readFileSync(join(repositoryRoot, "tsconfig.json"), "utf-8"),
).compilerOptions as { paths: Record<string, readonly string[]> };

function toSource(subpath: string, file: string): string {
  const key =
    subpath === "." ? manifest.name : `${manifest.name}/${subpath.slice(2)}`;

  return paths[key]?.[0] ?? file;
}

const unlinkedEntries: ReadonlySet<string> = new Set([".git", "package.json"]);

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
    entries(manifest.exports).map(([path, file]) => {
      return [path, file.startsWith("./dist/") ? toSource(path, file) : file];
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
