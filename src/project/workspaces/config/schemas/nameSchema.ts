import { string } from "valibot";

import { declare, unset } from "#foundation/options/index";
import { directoryPlaceholder } from "#project/workspaces/constants";

export const nameSchema = declare(string(), {
  description: [
    `Package name of the scope, with \`${directoryPlaceholder}\` standing for the name of its directory.`,
    "Sync writes it as the `name` of the scope's `package.json`; a workspace's `.workspace.json` overrides its glob entry's.",
  ],
  optional: unset("the `name` of `package.json`"),
});
