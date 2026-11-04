import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";

import { isArray } from "@auaust/toolkit/isArray";
import { isString } from "@auaust/toolkit/isString";

import { isWithin } from "#foundation/filesystem/utils/isWithin";
import { resolveWithin } from "#foundation/filesystem/utils/resolveWithin";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

function readManifest(manifest: File): string[] {
  if (!existsSync(manifest)) {
    return [];
  }

  const content: unknown = JSON.parse(readFileSync(manifest, "utf-8"));

  return isArray(content) ? content.filter(isString) : [];
}

// @debt the plugin hooks wrapping this module in tsdown and Vite are untested; no test runs a real build with `clean: "emitted"`
export function createEmittedManifest({
  manifest,
  outDir,
}: {
  manifest: File;
  outDir: Directory;
}) {
  const emitted = new Set<string>();

  let removed = false;
  let failed = false;

  function removePrevious() {
    if (removed) {
      return;
    }

    removed = true;

    for (const file of readManifest(manifest)) {
      if (isWithin(outDir, file)) {
        rmSync(resolveWithin(outDir, file), { force: true });
      }
    }
  }

  function add(files: Iterable<string>) {
    for (const file of files) {
      emitted.add(file);
    }
  }

  function fail() {
    failed = true;
  }

  function write() {
    if (failed) {
      return;
    }

    mkdirSync(dirname(manifest), { recursive: true });
    writeFileSync(manifest, JSON.stringify([...emitted].sort()));
  }

  return {
    removePrevious,
    add,
    fail,
    write,
  };
}
