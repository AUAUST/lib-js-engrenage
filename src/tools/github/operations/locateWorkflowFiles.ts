import { map } from "@auaust/primitive-kit/arrays";

import {
  isWithin,
  relativeWithin,
  resolveWithin,
} from "#foundation/filesystem/index";
import { workflowsDirectory, workflowSets } from "#tools/github/constants";
import type { ConfigResolver, FileLocation } from "#project/config/index";

export async function locateWorkflowFiles(
  config: ConfigResolver,
): Promise<FileLocation | undefined> {
  const [
    { workflows },
    git,
  ] = await Promise.all([config.resolve("github"), config.resolve("git")]);

  if (workflows === false) {
    return;
  }

  const { root } = config.context;

  const files = map(workflowSets[workflows].files, (file) => {
    return resolveWithin(git.root, `${workflowsDirectory}/${file}`);
  });

  if (!files.every((file) => isWithin(root, file))) {
    return;
  }

  return {
    globs: map(files, (file) => relativeWithin(root, file)),
  };
}
