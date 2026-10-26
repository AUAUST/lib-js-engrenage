import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { includes, map } from "@auaust/primitive-kit/arrays";
import { hasOwn } from "@auaust/toolkit/object";

import { changesetsCli } from "#constants";
import {
  workflowFiles,
  workflowHeader,
  workflowsDirectory,
  workflowTemplates,
} from "#github/constants";
import { syncFiles } from "#utils/syncFiles";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";
import type { SyncResults } from "#types/SyncResults";

const placeholder = /(?<!\$)\{\{ (\w+) \}\}/g;

function isSynced(config: ResolvedConfig): boolean {
  return (
    config.github.workflows ??
    (includes(config.presets, "library") &&
      config.environment.hasDependency(changesetsCli))
  );
}

function assertScripts(config: ResolvedConfig, names: ReadonlyArray<string>) {
  const scripts = config.packageJson.optional.scripts ?? {};

  for (const name of names) {
    if (!hasOwn(scripts, name)) {
      throw new Error(
        `${config.packageJsonPath} does not declare the "${name}" script that the generated workflows run`,
      );
    }
  }
}

function renderTemplate(
  file: File,
  values: Readonly<Record<string, string>>,
): string {
  const template = readFileSync(
    createRequire(import.meta.url).resolve(`${workflowTemplates}/${file}`),
    "utf8",
  );

  return (
    workflowHeader +
    template.replaceAll(placeholder, (_, name: string) => {
      if (!hasOwn(values, name)) {
        throw new Error(`Unknown placeholder "${name}" in workflow ${file}`);
      }

      return values[name];
    })
  );
}

export function syncWorkflowFiles({
  config,
  check = false,
}: {
  config: ResolvedConfig;
  check?: boolean;
}): SyncResults {
  if (!isSynced(config)) {
    return [];
  }

  const { prepareScript, publishScript } = config.github;

  assertScripts(config, [prepareScript, publishScript]);

  const files = map(workflowFiles, (file) => {
    const content = renderTemplate(file, {
      prepareScript,
      publishScript,
    });

    return {
      file: `${workflowsDirectory}/${file}`,
      initial: content,
      update() {
        return content;
      },
    };
  });

  return syncFiles({
    root: config.root,
    files,
    check,
  });
}
