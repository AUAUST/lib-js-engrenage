import { mkdirSync, readdirSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { entries, record } from "@auaust/toolkit/object";

import manifest from "#package.json" with { type: "json" };

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));

export function linkSourcePackage(target: string) {
  mkdirSync(target, {
    recursive: true,
  });

  for (const entry of readdirSync(repositoryRoot)) {
    if (entry !== "package.json") {
      symlinkSync(join(repositoryRoot, entry), join(target, entry));
    }
  }

  const exports = record(
    entries(manifest.exports).map(([path, file]) => {
      return [path, file.replace(/^\.\/dist\/(.+)\.mjs$/, "./src/$1.ts")];
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
