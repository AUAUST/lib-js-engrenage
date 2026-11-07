import { looseObject, optional, string } from "valibot";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { startsWith } from "@auaust/primitive-kit/strings";

import { packageJsonFile } from "#constants";
import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { accessByVisibility } from "#project/package/constants";
import {
  createPackageJson,
  visibilitySection,
  type PublishAccess,
  type Visibility,
} from "#project/package/index";
import { traitsSection } from "#project/presets/index";
import { workspacesSection } from "#project/workspaces/index";
import { configFile } from "#tools/changesets/constants";
import { npmrcFile } from "#tools/pnpm/constants";
import type { LoadedConfig } from "#project/config/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

interface Publishing {
  published: boolean;
  visibility: Visibility;
  access: PublishAccess;
}

const credentialSettings = ["_authToken", "_auth", "_password"] as const;

function listPackageViolations(
  file: File,
  content: string | undefined,
  root: Directory,
  isRoot: boolean,
  { published, visibility, access }: Publishing,
): string[] {
  if (!published || content === undefined) {
    return [];
  }

  const {
    name,
    private: unpublished,
    publishConfig,
  } = createPackageJson({
    root,
    path: file,
    content,
  }).optional;

  if (unpublished === true) {
    return isRoot ? [`${file}: "private": true on a published package`] : [];
  }

  const violations: string[] = [];

  if (publishConfig?.access !== access) {
    violations.push(
      `${file}: publishConfig.access is ${publishConfig?.access ?? "unset"} instead of ${access}`,
    );
  }

  if (visibility === "private" && !startsWith(name ?? "", "@")) {
    violations.push(
      `${file}: the package ${name ?? "without a name"} is unscoped, so npm cannot make it private`,
    );
  }

  if (visibility === "private" && publishConfig?.provenance === true) {
    violations.push(`${file}: publishConfig.provenance is true`);
  }

  return violations;
}

function listNpmrcViolations(
  file: File,
  content: string | undefined,
  { published, visibility }: Publishing,
): string[] {
  return flatMap((content ?? "").split("\n"), (line): string[] => {
    const setting = line.trim();

    if (
      setting === "" ||
      startsWith(setting, "#") ||
      startsWith(setting, ";")
    ) {
      return [];
    }

    const separator = setting.indexOf("=");

    const key = (
      separator === -1 ? setting : setting.slice(0, separator)
    ).trim();

    const settingName = key.slice(key.lastIndexOf(":") + 1);

    if (credentialSettings.some((credential) => credential === settingName)) {
      return [`${file}: holds the credential ${key}`];
    }

    const value = separator === -1 ? "" : setting.slice(separator + 1).trim();

    if (
      published &&
      visibility === "private" &&
      key === "provenance" &&
      value === "true"
    ) {
      return [`${file}: provenance=true`];
    }

    return [];
  });
}

async function listChangesetViolations(
  config: LoadedConfig,
  { published, access }: Publishing,
): Promise<string[]> {
  const content = await config.context.filesystem.read(configFile);

  if (!published || content === undefined) {
    return [];
  }

  const changesets = validate(
    looseObject({ access: optional(string()) }),
    parseJson(content, configFile),
    configFile,
  );

  return changesets.access === access
    ? []
    : [
        `${configFile}: access is ${changesets.access ?? "unset"} instead of ${access}`,
      ];
}

export async function checkPublishing(config: LoadedConfig) {
  const { filesystem, root } = config.context;

  const [traits, visibility, groups] = await Promise.all([
    config.resolve(traitsSection),
    config.resolve(visibilitySection),
    config.resolve(workspacesSection),
  ]);

  const publishing: Publishing = {
    published: traits.published,
    visibility,
    access: accessByVisibility[visibility],
  };

  const packages = [
    { dir: undefined, packageJson: packageJsonFile },
    ...flatMap(groups, ({ workspaces }) => workspaces),
  ];

  const violations: string[] = [];

  for (const { dir, packageJson } of packages) {
    const npmrc = dir === undefined ? npmrcFile : `${dir}/${npmrcFile}`;

    violations.push(
      ...listPackageViolations(
        packageJson,
        await filesystem.read(packageJson),
        root,
        dir === undefined,
        publishing,
      ),
      ...listNpmrcViolations(npmrc, await filesystem.read(npmrc), publishing),
    );
  }

  violations.push(...(await listChangesetViolations(config, publishing)));

  if (violations.length > 0) {
    throw new Error(
      [
        `The publishing configuration could publish the package against its ${publishing.published ? `${visibility} visibility` : "unpublished state"}:`,
        ...violations.map((violation) => `- ${violation}`),
      ].join("\n"),
    );
  }
}
