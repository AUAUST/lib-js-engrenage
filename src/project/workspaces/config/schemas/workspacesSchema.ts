import { Minimatch } from "minimatch";
import { string } from "valibot";

import { entries } from "@auaust/toolkit/object";

import { declareRecord } from "#foundation/options/index";
import { workspaceSchema } from "#project/workspaces/config/schemas/workspaceSchema";
import { directoryPlaceholder } from "#project/workspaces/constants";

export const workspacesSchema = declareRecord(string(), workspaceSchema, {
  description: [
    "Workspaces of the project, by the glob matching their directories (`extensions/*`).",
    "Each glob is one environment; workspaces needing another structure or runtime get a glob of their own.",
    "Sync keeps `pnpm-workspace.yaml` in line with the globs and writes the managed keys of each workspace `package.json` and `tsconfig.json`.",
  ],
  optional: {
    value: {},
  },
  assertResolved(workspaces, path) {
    for (const [glob, { name }] of entries(workspaces)) {
      if (
        new Minimatch(glob).hasMagic() &&
        !name.includes(directoryPlaceholder)
      ) {
        throw new Error(
          `${path}.${glob}.name must contain ${directoryPlaceholder}, so every workspace its wildcard matches gets its own package name`,
        );
      }
    }
  },
});
