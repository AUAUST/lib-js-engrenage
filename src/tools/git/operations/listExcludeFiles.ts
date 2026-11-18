import { homedir } from "node:os";
import { join, resolve } from "node:path";

import { filter } from "@auaust/toolkit/array";

import { pathExists } from "#foundation/filesystem/index";
import { gitDirectory } from "#tools/git/constants";
import { runGit } from "#tools/git/operations/runGit";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";

function defaultExcludesFile(): string {
  const configHome = process.env.XDG_CONFIG_HOME;

  return join(
    configHome === undefined || configHome === ""
      ? join(homedir(), ".config")
      : configHome,
    "git",
    "ignore",
  );
}

export async function listExcludeFiles(root: Directory): Promise<Files> {
  if (!(await pathExists(join(root, gitDirectory)))) {
    return [];
  }

  const [infoExclude, excludesFile] = await Promise.all([
    runGit(root, ["rev-parse", "--git-path", "info/exclude"]),
    runGit(root, [
      "config",
      "--path",
      "--default",
      "",
      "--get",
      "core.excludesFile",
    ]),
  ]);

  const configured = excludesFile.trim();

  const files = [
    resolve(root, infoExclude.trim()),
    configured === "" ? defaultExcludesFile() : resolve(root, configured),
  ];

  const exists = await Promise.all(files.map((file) => pathExists(file)));

  return filter(files, (_, index) => exists[index]);
}
