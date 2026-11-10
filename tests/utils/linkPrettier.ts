import { mkdirSync, symlinkSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export function linkPrettier(target: string) {
  mkdirSync(dirname(target), {
    recursive: true,
  });

  symlinkSync(
    dirname(fileURLToPath(import.meta.resolve("prettier/package.json"))),
    target,
  );
}
