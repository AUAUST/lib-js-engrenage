import { record, string } from "valibot";

import { fileSchema } from "#config/config/schemas/values/fileSchema";
import { nodeMajorSchema } from "#config/config/schemas/values/nodeMajorSchema";
import {
  defaultBinDirectories,
  disabledCodeEnvironment,
} from "#config/constants";
import { createCodeEnvironment } from "#config/utils/createCodeEnvironment";
import { declare } from "#foundation/options/utils/declare";
import { declareObject } from "#foundation/options/utils/declareObject";
import { unset } from "#foundation/options/utils/unset";
import type { ConfigContext } from "#config/types/ConfigContext";

export const binSchema = declareObject(
  {
    ...createCodeEnvironment("bin", defaultBinDirectories),
    commands: declare(record(string(), fileSchema), {
      description: [
        "Commands the package exposes, mapped to their entry file.",
        "They feed the tsdown entries and the `bin` field of `package.json`.",
      ],
      optional: unset("the entry files found in the bin directories"),
    }),
    node: declare(nodeMajorSchema, {
      description: [
        // @debt the "engines.node floor" claim was written from reading the code and not verified by running it
        "Node major the commands target: it feeds the `engines.node` floor of `package.json`.",
      ],
      optional: {
        explain: "`runtime.node`",
        compute(context: ConfigContext) {
          return context.get("runtime").node;
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
    disable: {
      value: {
        ...disabledCodeEnvironment,
        commands: undefined,
        node: undefined,
      },
    },
  },
);
