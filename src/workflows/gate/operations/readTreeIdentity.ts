import { listIgnoredOutputs } from "#project/generators/index";
import {
  hashTree,
  listChangedFiles,
  listLocalFiles,
  readHead,
  type ChangeMode,
} from "#tools/git/index";
import { listLocalFilePatterns } from "#tools/metalbrain/index";
import type { LoadedConfig } from "#project/config/index";
import type { TreeIdentity } from "#workflows/gate/types/TreeIdentity";

/**
 * The identity of the tree a gate run in `mode` verifies, holding the generated
 * files Git ignores, since the checks read them too.
 */
export async function readTreeIdentity(
  config: LoadedConfig,
  mode: ChangeMode,
): Promise<TreeIdentity> {
  const { root } = config.context;

  const git = await config.resolve("git");

  const [patterns, changed, include] = await Promise.all([
    listLocalFilePatterns(config),
    listChangedFiles(root, "worktree"),
    listIgnoredOutputs(config),
  ]);

  const local = await listLocalFiles(git, root, patterns, changed);

  const [head = "-", committable, checked] = await Promise.all([
    readHead(root),
    hashTree(root, {
      mode: "worktree",
      exclude: local,
      include,
    }),
    hashTree(root, { mode, include }),
  ]);

  return {
    head,
    committable,
    checked,
  };
}
