import { map } from "@auaust/primitive-kit/arrays";

import { packages } from "#constants";
import { listScannedFiles } from "#tools/jscpd/index";
import { defineToolCommands } from "#workflows/cli/operations/defineToolCommands";

export const jscpd = defineToolCommands({
  packageName: packages.jscpd,
  commands: {
    jscpd: {
      message: "Detecting duplicated code...",
      async arguments(config, args) {
        const files = await listScannedFiles(config);

        args.push(...map(files, (file) => config.context.path(file)));
      },
    },
  },
});
