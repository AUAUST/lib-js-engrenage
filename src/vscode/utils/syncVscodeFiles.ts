import { existsSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";

import {
  deduplicate,
  every,
  flatMap,
  includes,
} from "@auaust/primitive-kit/arrays";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { entries } from "@auaust/toolkit/object";
import {
  applyEdits,
  findNodeAtLocation,
  getNodeValue,
  modify,
  parseTree,
  printParseErrorCode,
  type JSONPath,
  type Node,
  type ParseError,
} from "jsonc-parser";
import { array, optional, string } from "valibot";

import { syncFiles } from "#utils/syncFiles";
import { validate } from "#utils/validate";
import {
  emptyObjectFile,
  extensionsFile,
  formattingOptions,
  integrations,
  settingsFile,
} from "#vscode/constants";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";
import type { FileSync } from "#types/FileSync";
import type { SyncResults } from "#types/SyncResults";
import type { Setting } from "#vscode/types/Setting";
import type { Settings } from "#vscode/types/Settings";

interface SettingEdit {
  path: JSONPath;
  value: Setting | undefined;
}

function parseObject(content: string, path: File): Node {
  const errors: ParseError[] = [];

  const tree = parseTree(content, errors, {
    allowTrailingComma: true,
  });

  const [error] = errors;

  if (error !== undefined) {
    throw new Error(
      `Invalid JSON in ${path}: ${printParseErrorCode(error.error)} at offset ${error.offset}`,
    );
  }

  if (tree?.type !== "object") {
    throw new Error(`${path} must contain a JSON object`);
  }

  return tree;
}

function valueAt(content: string, path: File, location: JSONPath): unknown {
  const node = findNodeAtLocation(parseObject(content, path), location);

  return node === undefined ? undefined : getNodeValue(node);
}

function modifyJson(
  content: string,
  path: File,
  location: JSONPath,
  value: Setting | undefined,
  isArrayInsertion = false,
): string {
  try {
    const edits = modify(content, location, value, {
      formattingOptions,
      isArrayInsertion,
    });

    return applyEdits(content, edits);
  } catch (error) {
    throw new Error(`Cannot set "${location.join(" > ")}" in ${path}`, {
      cause: error,
    });
  }
}

function applySetting(
  content: string,
  path: File,
  { path: location, value }: SettingEdit,
): string {
  if (isDeepStrictEqual(valueAt(content, path, location), value)) {
    return content;
  }

  return modifyJson(content, path, location, value);
}

function flattenSettings(
  settings: Settings,
  parent: JSONPath = [],
): SettingEdit[] {
  return flatMap(entries(settings), ([key, value]) => {
    const path = [...parent, key];

    if (isPlainObject(value)) {
      return flattenSettings(value, path);
    }

    return [
      {
        path,
        value,
      },
    ];
  });
}

function applySettings(
  content: string,
  path: File,
  edits: ReadonlyArray<SettingEdit>,
): string {
  parseObject(content, path);

  let synced = content;

  for (const edit of edits) {
    synced = applySetting(synced, path, edit);
  }

  return synced;
}

function addRecommendations(
  content: string,
  path: File,
  extensions: ReadonlyArray<string>,
): string {
  const recommendations = validate(
    optional(array(string())),
    valueAt(content, path, ["recommendations"]),
    `${path} recommendations`,
  );

  let synced = content;

  for (const extension of extensions) {
    if (!includes(recommendations ?? [], extension)) {
      synced = modifyJson(
        synced,
        path,
        ["recommendations", -1],
        extension,
        true,
      );
    }
  }

  return synced;
}

function isSynced(
  config: ResolvedConfig,
  enabled: boolean | undefined,
  file: File,
): boolean {
  return enabled ?? existsSync(config.resolve(file));
}

export function syncVscodeFiles({
  config,
  check = false,
}: {
  config: ResolvedConfig;
  check?: boolean;
}): SyncResults {
  const applicable = integrations.filter(({ requires }) => {
    return every(requires, (name) => config.environment.has(name));
  });

  const settings = flatMap(applicable, (integration) => {
    return flattenSettings(integration.settings);
  });

  const extensions = deduplicate(
    flatMap(applicable, (integration) => {
      return integration.extensions;
    }),
  );

  const files: FileSync[] = [];

  if (isSynced(config, config.vscode.settings, settingsFile)) {
    files.push({
      file: settingsFile,
      initial: emptyObjectFile,
      update(content, path) {
        return applySettings(content, path, settings);
      },
    });
  }

  if (isSynced(config, config.vscode.extensions, extensionsFile)) {
    files.push({
      file: extensionsFile,
      initial: emptyObjectFile,
      update(content, path) {
        return addRecommendations(content, path, extensions);
      },
    });
  }

  return syncFiles({
    root: config.root,
    files,
    check,
  });
}
