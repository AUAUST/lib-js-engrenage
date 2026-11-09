import { record, string } from "valibot";

import {
  declare,
  declareObject,
  fileSchema,
  unset,
} from "#foundation/options/index";
import { nodeMajorSchema } from "#project/baseline/index";
import { declareCodeEnvironment } from "#project/environments/config/declarers/declareCodeEnvironment";
import { declareProgramLayout } from "#project/environments/config/declarers/declareProgramLayout";
import {
  defaultBinDirectories,
  disabledCodeEnvironment,
} from "#project/environments/constants";
import { rolesSchema } from "#project/roles/index";
import type { ResolvedRuntimeSettings } from "#project/config/index";

export const binSchema = declareObject(
  {
    ...declareCodeEnvironment("bin", {
      dirs: defaultBinDirectories,
      defines: false,
    }),
    tree: declareProgramLayout(),
    roles: rolesSchema,
    entries: declare(record(string(), fileSchema), {
      description: [
        "Commands the package exposes, mapped to their entry file.",
        "They feed the tsdown entries and the `bin` field of `package.json`.",
      ],
      optional: unset("the entry files found in the bin directories"),
    }),
    node: declare(nodeMajorSchema, {
      description: [
        "Node major the commands target: it feeds the `engines.node` floor of `package.json`.",
      ],
      optional: {
        explain: "`runtime.node`",
        compute(context: { runtime: ResolvedRuntimeSettings }) {
          return context.runtime.node;
        },
      },
    }),
  },
  {
    description: [
      "The environment of the command-line entries of the package.",
      "`false` disables it.",
    ],
    optional: true,
    renamed: {
      layout: "tree",
      commands: "entries",
    },
    disable: {
      value: {
        ...disabledCodeEnvironment,
        entries: undefined,
        node: undefined,
      },
    },
  },
);
