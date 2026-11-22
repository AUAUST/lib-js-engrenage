import { isPlainObject, object } from "@auaust/toolkit";

import { formatBlockMarker } from "#foundation/blocks/index";
import { readJsonValue, type JsonIndentation } from "#foundation/json/index";
import { markdownBlocks } from "#metalbrain/instructions/constants";
import { formerCodexFiles } from "#metalbrain/runtimes/constants";
import { syncHooks } from "#metalbrain/runtimes/operations/syncHooks";
import type { Filesystem } from "#foundation/filesystem/index";
import type { HookRoots } from "#metalbrain/runtimes/types/HookRoots";

/**
 * Removes the Codex instructions and hooks engrenage generated before Codex
 * support was removed: `AGENTS.override.md` while it holds the dispatch block sync
 * wrote, and engrenage's entries of `.codex/hooks.json`, deleting the file once
 * no hook remains. Skills and agent profiles are left to `migrateSkillFiles`.
 */
export async function removeCodexFiles(config: {
  filesystem: Filesystem;
  resolve(...paths: string[]): string;
  roots: HookRoots;
  indentation: JsonIndentation;
}) {
  const { filesystem, roots, indentation } = config;

  const { instructions, hooks: file, hookMarkers } = formerCodexFiles;

  const content = await filesystem.read(instructions);

  if (content?.includes(formatBlockMarker(markdownBlocks, "dispatch"))) {
    await filesystem.remove(instructions);
  }

  if (!(await filesystem.exists(file))) {
    return;
  }

  await syncHooks(config, {
    file,
    hooks: [],
    markers: hookMarkers,
    roots,
    indentation,
  });

  const remaining = readJsonValue(
    (await filesystem.read(file)) ?? "{}",
    config.resolve(file),
    [],
  );

  const isEmpty = (
    isPlainObject(remaining) &&
    object.values(remaining).every((value) => {
      return isPlainObject(value) && object.keys(value).length === 0;
    })
  );

  if (isEmpty) {
    await filesystem.remove(file);
  }
}
