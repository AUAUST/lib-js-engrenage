import { record, string, unknown } from "valibot";

import { declare } from "#foundation/options/utils/declare";
import { declareObject } from "#foundation/options/utils/declareObject";
import { declareRecord } from "#foundation/options/utils/declareRecord";
import { declareList } from "#project/config/config/declareList";
import { declareManagedList } from "#project/config/config/declareManagedList";
import { globSchema } from "#project/config/config/schemas/values/globsSchema";
import { directoryPlaceholder } from "#project/workspaces/constants";

const workspaceSchema = declareObject(
  {
    name: declare(string(), {
      description: [
        `Package name of every workspace the glob matches, with \`${directoryPlaceholder}\` standing for the directory name of the workspace.`,
        "Sync writes it as the `name` of the workspace `package.json`.",
      ],
    }),
    generated: declareList(globSchema, {
      description:
        "Globs, inside each workspace, of files produced by tools, handled as `src.generated` is.",
      optional: { value: [] },
    }),
    discovered: declareList(globSchema, {
      description:
        "Globs, inside each workspace, of files that tools discover by path and that may export defaults, handled as `src.discovered` is.",
      optional: { value: [] },
    }),
    tsconfig: declareObject(
      {
        extends: declareManagedList(string(), {
          description: [
            "Value of `extends` in the `tsconfig.json` of each workspace.",
            "`false` leaves the field to the file.",
          ],
          explain: "the base tsconfig",
        }),
        include: declareManagedList(string(), {
          description: [
            "Value of `include` in the `tsconfig.json` of each workspace.",
            "`false` leaves the field to the file.",
          ],
          explain: "the TypeScript files of the workspace",
        }),
        exclude: declareManagedList(string(), {
          description: [
            "Value of `exclude` in the `tsconfig.json` of each workspace.",
            "`false` leaves the field to the file.",
          ],
          explain: "none, so the field is left to the file",
        }),
        lib: declareManagedList(string(), {
          description: [
            "Value of `compilerOptions.lib` in the `tsconfig.json` of each workspace.",
            "`false` leaves the field to the file.",
          ],
          explain: "none, so the field is left to the file",
        }),
        types: declareManagedList(string(), {
          description: [
            "Value of `compilerOptions.types` in the `tsconfig.json` of each workspace.",
            "`false` leaves the field to the file.",
          ],
          explain: "none, so the field is left to the file",
        }),
        compilerOptions: declare(record(string(), unknown()), {
          description:
            "Options written into `compilerOptions` of each workspace `tsconfig.json`.",
          optional: {
            value: {},
          },
        }),
        unmanaged: declareList(string(), {
          description:
            "Dotted paths in each workspace `tsconfig.json` that sync never writes.",
          optional: { value: [] },
        }),
      },
      {
        description:
          "Options of the `tsconfig.json` sync writes in each workspace.",
        optional: true,
      },
    ),
  },
  {
    description:
      "The environment of the workspaces a glob matches: each matched directory is a workspace with its own `package.json` and `tsconfig.json`.",
    assert({ name }, path) {
      if (!name.includes(directoryPlaceholder)) {
        throw new Error(
          `${path}.name must contain ${directoryPlaceholder}, so every workspace gets its own package name`,
        );
      }
    },
  },
);

export const workspacesSchema = declareRecord(string(), workspaceSchema, {
  description: [
    "Workspaces of the project, by the glob matching their directories (`extensions/*`).",
    "Each glob is one environment; workspaces needing another structure or runtime get a glob of their own.",
    "Sync keeps `pnpm-workspace.yaml` in line with the globs and writes the managed keys of each workspace `package.json` and `tsconfig.json`.",
  ],
  optional: {
    value: {},
  },
});
