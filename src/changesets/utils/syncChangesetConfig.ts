import { createRequire } from "node:module";

import { object, string } from "valibot";

import { isString } from "@auaust/toolkit/isString";

import {
  configFile,
  defaultAccess,
  defaultChangelog,
  sharedOptions,
} from "#changesets/constants";
import {
  changesetsChangelogGithub,
  changesetsCli,
  changesetsConfig,
  packageJsonFile,
} from "#constants";
import { readJsonFile } from "#support/filesystem/utils/readJsonFile";
import { emptyObjectFile } from "#support/json/constants";
import { applyJsonEdits } from "#support/json/utils/applyJsonEdits";
import { flattenJsonObject } from "#support/json/utils/flattenJsonObject";
import { syncFiles } from "#utils/syncFiles";
import { validate } from "#utils/validate";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonValue } from "#support/json/types/JsonValue";
import type { File } from "#types/File";
import type { SyncResults } from "#types/SyncResults";

const githubShorthand = /^(?:github:)?([\w.-]+)\/([\w.-]+)$/;

const githubUrl = /github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/;

function resolveConfigVersion(packageJsonPath: File): string {
  try {
    const cliManifest = createRequire(packageJsonPath).resolve(
      `${changesetsCli}/${packageJsonFile}`,
    );

    const configManifest = createRequire(cliManifest).resolve(
      `${changesetsConfig}/${packageJsonFile}`,
    );

    return validate(
      object({
        version: string(),
      }),
      readJsonFile(configManifest),
      configManifest,
    ).version;
  } catch (error) {
    throw new Error(
      `Cannot resolve the installed ${changesetsConfig} version from ${packageJsonPath}`,
      {
        cause: error,
      },
    );
  }
}

function toGithubRepository(
  repository: string | { url: string } | undefined,
): string | undefined {
  const url = isString(repository) ? repository : repository?.url;

  if (url === undefined) {
    return undefined;
  }

  const match = githubShorthand.exec(url) ?? githubUrl.exec(url);

  if (match === null) {
    return undefined;
  }

  const [, owner, name] = match;

  return `${owner}/${name}`;
}

function createChangelog(config: ResolvedConfig): JsonValue {
  const repo = toGithubRepository(config.packageJson.optional.repository);

  if (
    repo === undefined ||
    !config.environment.hasDependency(changesetsChangelogGithub)
  ) {
    return defaultChangelog;
  }

  return [
    changesetsChangelogGithub,
    {
      repo,
    },
  ];
}

export function syncChangesetConfig({
  config,
  check = false,
}: {
  config: ResolvedConfig;
  check?: boolean;
}): SyncResults {
  if (!config.environment.hasDependency(changesetsCli)) {
    return [];
  }

  const { packageJsonPath } = config;

  if (packageJsonPath === undefined) {
    throw new Error(`No ${packageJsonFile} found in ${config.root}`);
  }

  const version = resolveConfigVersion(packageJsonPath);

  const options = flattenJsonObject({
    $schema: `https://unpkg.com/${changesetsConfig}@${version}/schema.json`,
    ...sharedOptions,
    access: config.packageJson.optional.publishConfig?.access ?? defaultAccess,
    changelog: createChangelog(config),
  });

  return syncFiles({
    root: config.root,
    files: [
      {
        file: configFile,
        initial: emptyObjectFile,
        update(content, path) {
          return applyJsonEdits(content, path, options);
        },
      },
    ],
    check,
  });
}
