import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { isArray } from "@auaust/toolkit/isArray";
import { isString } from "@auaust/toolkit/isString";

import {
  isWithin,
  pathExists,
  resolveWithin,
} from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

async function readManifest(manifest: File): Promise<string[]> {
  if (!(await pathExists(manifest))) {
    return [];
  }

  const content: unknown = JSON.parse(await readFile(manifest, "utf-8"));

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

  async function removePrevious() {
    if (removed) {
      return;
    }

    removed = true;

    const previous = await readManifest(manifest);

    await Promise.all(
      previous
        .filter((file) => isWithin(outDir, file))
        .map((file) => rm(resolveWithin(outDir, file), { force: true })),
    );
  }

  function add(files: Iterable<string>) {
    for (const file of files) {
      emitted.add(file);
    }
  }

  function fail() {
    failed = true;
  }

  async function write() {
    if (failed) {
      return;
    }

    await mkdir(dirname(manifest), { recursive: true });
    await writeFile(manifest, JSON.stringify([...emitted].sort()));
  }

  return {
    removePrevious,
    add,
    fail,
    write,
  };
}
