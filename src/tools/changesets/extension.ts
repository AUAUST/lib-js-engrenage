import { changelogGlob, changesetsCli } from "#tools/changesets/constants";
import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "tools/changesets",
  when: { installed: changesetsCli },
  owns: {
    files: {
      "CHANGELOG.md": {
        title: "Changelog",
        generated: true,
        async locate(): Promise<FileLocation> {
          return { globs: [changelogGlob] };
        },
      },
    },
  },
} satisfies Extension;
