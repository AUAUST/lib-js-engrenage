import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";

export const changesetDirectory = ".changeset" satisfies Directory;

export const configFile = `${changesetDirectory}/config.json` satisfies File;

export const changelogFile = "CHANGELOG.md" satisfies File;

export const changelogGlob = `**/${changelogFile}` satisfies Glob;

export { changesetsCli } from "#constants";
