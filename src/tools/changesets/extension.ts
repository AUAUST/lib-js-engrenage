import {
  changelogGlob,
  changesetDirectory,
  changesetsCli,
} from "#tools/changesets/constants";
import type { Extension, FileLocation } from "#project/config/index";

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
