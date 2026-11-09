import { listLocalFilePatterns } from "#tools/agents/index";
import {
  hashTree,
  listChangedFiles,
  listLocalFiles,
  readHead,
  type ChangeMode,
} from "#tools/git/index";
import type { LoadedConfig } from "#project/config/index";
import type { TreeIdentity } from "#workflows/gate/types/TreeIdentity";

export async function readTreeIdentity(
  config: LoadedConfig,
  mode: ChangeMode,
): Promise<TreeIdentity> {
  const { root } = config.context;

  const git = await config.resolve("git");

  const local = await listLocalFiles(
    git,
    root,
    await listLocalFilePatterns(config),
    await listChangedFiles(root, "worktree"),
  );

  const [head = "-", committable, checked] = await Promise.all([
    readHead(root),
    hashTree(root, { mode: "worktree", exclude: local }),
    hashTree(root, { mode }),
  ]);

  return {
    head,
    committable,
    checked,
  };
}
