import {
  changelogGlob,
  changesetDirectory,
  changesetsCli,
} from "#tools/changesets/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Active when `@changesets/cli` is installed; owns the changelogs and the
 * `.changeset` directory and syncs `.changeset/config.json`.
 */
export default {
  name: "tools/changesets",
  when: {
    installed: changesetsCli,
  },
  owns: {
    files: {
      "CHANGELOG.md": {
        title: "Changelog",
        generated: true,
        locate(): FileLocation {
          return { globs: [changelogGlob] };
        },
      },
      "changesets": {
        title: "Changesets",
        locate(): FileLocation {
          return { directory: changesetDirectory };
        },
      },
    },
  },
  contributes: {
    "sync.targets": [
      {
        name: "changesets",
        stage: "write",
        async load() {
          const {
            syncChangesetConfig,
          } = await import("#tools/changesets/setup/syncChangesetConfig");

          return syncChangesetConfig;
        },
      },
    ],
  },
} satisfies Extension;
