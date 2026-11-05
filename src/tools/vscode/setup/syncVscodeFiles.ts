import { array, optional, string } from "valibot";

import {
  deduplicate,
  flatMap,
  includes,
  map,
} from "@auaust/primitive-kit/arrays";

import { emptyObjectFile } from "#foundation/json/constants";
import {
  applyJsonEdits,
  flattenJsonObject,
  readJsonValue,
  writeJsonValue,
  type JsonEdit,
} from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { jsonIndentation } from "#project/format/constants";
import { loadInfoRules } from "#tools/eslint/index";
import {
  eslintIntegration,
  extensionsFile,
  settingsFile,
} from "#tools/vscode/constants";
import { findIntegrations } from "#tools/vscode/utils/findIntegrations";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Environment } from "#project/config/index";
import type { Integration } from "#tools/vscode/types/Integration";
import type { ResolvedVscode } from "#tools/vscode/types/ResolvedVscode";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

interface VscodeSync {
  root: Directory;
  filesystem: Filesystem;
  resolve(...paths: string[]): string;
  environment: Environment;
  vscode: ResolvedVscode;
}

function addRecommendations(
  content: string,
  path: File,
  extensions: readonly string[],
): string {
  const recommendations = validate(
    optional(array(string())),
    readJsonValue(content, path, ["recommendations"]),
    `${path} recommendations`,
  );

  let synced = content;

  for (const extension of extensions) {
    if (!includes(recommendations ?? [], extension)) {
      synced = writeJsonValue(
        synced,
        path,
        ["recommendations", -1],
        extension,
        jsonIndentation,
        { isArrayInsertion: true },
      );
    }
  }

  return synced;
}

function isEnabled(
  { filesystem }: { filesystem: Filesystem },
  file: File,
  configured: boolean | undefined,
  requested: boolean,
): boolean {
  if (configured === false) {
    return false;
  }

  return configured === true || requested || filesystem.exists(file);
}

async function createSettingsEdits(
  root: Directory,
  applicable: readonly Integration[],
): Promise<JsonEdit[]> {
  const infoRules = includes(applicable, eslintIntegration)
    ? await loadInfoRules(root)
    : [];

  return flatMap(applicable, (integration) => {
    const edits = flattenJsonObject(integration.settings);

    if (integration !== eslintIntegration) {
      return edits;
    }

    return [
      ...edits,
      {
        path: ["eslint.rules.customizations"],
        value: map(infoRules, (rule) => {
          return {
            rule,
            severity: "info",
          };
        }),
      },
    ];
  });
}

export async function syncVscodeFiles(
  config: VscodeSync,
  {
    settings = false,
    extensions = false,
  }: {
    settings?: boolean;
    extensions?: boolean;
  } = {},
) {
  const { filesystem } = config;

  const applicable = findIntegrations(config.environment.hasDependency);

  const recommendations = deduplicate(
    flatMap(applicable, (integration) => {
      return integration.extensions;
    }),
  );

  if (isEnabled(config, settingsFile, config.vscode.settings, settings)) {
    filesystem.write(
      settingsFile,
      applyJsonEdits(
        filesystem.read(settingsFile) ?? emptyObjectFile,
        config.resolve(settingsFile),
        await createSettingsEdits(config.root, applicable),
        jsonIndentation,
      ),
    );
  }

  if (isEnabled(config, extensionsFile, config.vscode.extensions, extensions)) {
    filesystem.write(
      extensionsFile,
      addRecommendations(
        filesystem.read(extensionsFile) ?? emptyObjectFile,
        config.resolve(extensionsFile),
        recommendations,
      ),
    );
  }
}
