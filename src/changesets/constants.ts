import { freeze } from "@auaust/toolkit/object";

import { changesetsCli } from "#constants";
import type { File } from "#types/File";

export const configFile = ".changeset/config.json" satisfies File;

export const defaultChangelog = `${changesetsCli}/changelog`;

export const defaultAccess = "restricted";

export const sharedOptions = freeze({
  baseBranch: "main",
  commit: false,
  format: "auto",
  updateInternalDependencies: "patch",
} as const);
