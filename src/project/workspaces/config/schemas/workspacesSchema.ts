import { Minimatch } from "minimatch";
import { picklist, string } from "valibot";

import { entries } from "@auaust/toolkit/object";

import {
  declare,
  declareObject,
  declareRecord,
} from "#foundation/options/index";
import { workspaceSchema } from "#project/workspaces/config/schemas/workspaceSchema";
import { directoryPlaceholder } from "#project/workspaces/constants";

export const workspacesSchema = declareObject(
  {
    globs: declareRecord(string(), workspaceSchema, {
      description: [
        "Workspaces of the project, by the glob matching their directories (`extensions/*`).",
        "Each glob is one environment; workspaces needing another structure or runtime get a glob of their own.",
        "Sync keeps `pnpm-workspace.yaml` in line with the globs and writes the managed keys of each workspace `package.json`.",
      ],
      optional: {
        value: {},
      },
      assertResolved(globs, path) {
        for (const [glob, { name }] of entries(globs)) {
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
    }),
    extra: declare(picklist(["accept", "report"]), {
      description: [
        "What a `.workspace.json` no glob matches makes: `accept` keeps its directory a workspace, `report` reports it as an error and ignores it.",
      ],
      optional: { value: "accept" },
    }),
  },
  {
    description: "Workspaces of the project: the globs matching their directories, and how a workspace outside them is handled.",
    optional: true,
  },
);
