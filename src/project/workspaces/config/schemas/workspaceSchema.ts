import { string } from "valibot";

import {
  declare,
  declareList,
  declareObject,
  globSchema,
} from "#foundation/options/index";
import { directoryPlaceholder } from "#project/workspaces/constants";

// @debt a glob entry's config keys are typed `unknown` and validated only when a workspace of its glob resolves them, not against their own declarations at the root
export const workspaceSchema = declareObject(
  {
    name: declare(string(), {
      description: [
        `Package name of every workspace the glob matches, with \`${directoryPlaceholder}\` standing for the directory name of the workspace; required when the glob holds a wildcard.`,
        "Sync writes it as the `name` of the workspace `package.json`.",
      ],
    }),
    purpose: declare(string(), {
      description: "Purpose of every workspace the glob matches, unless its `.workspace.json` sets one.",
      optional: { value: undefined },
    }),
    generated: declareList(globSchema, {
      description: "Globs, inside each workspace, of files produced by tools, handled as `src.generated` is.",
      optional: { value: [] },
    }),
    discovered: declareList(globSchema, {
      description: "Globs, inside each workspace, of files that tools discover by path and that may export defaults, handled as `src.discovered` is.",
      optional: { value: [] },
    }),
  },
  {
    description: [
      "The environment of the workspaces a glob matches: each matched directory is a workspace with its own `package.json`.",
      "Its other keys are config keys its workspaces resolve below their `.workspace.json`; project-only keys are refused.",
    ],
    loose: true,
  },
);
