import type { File } from "#types/File";
import type { Glob } from "#types/Glob";

export const configFile = ".changeset/config.json" satisfies File;

export const changelogGlob = "**/CHANGELOG.md" satisfies Glob;

export { changesetsCli } from "#constants";
