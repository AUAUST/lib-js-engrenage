import { record, string } from "valibot";

import { declare } from "#foundation/options/utils/declare";
import { declareObject } from "#foundation/options/utils/declareObject";
import { unset } from "#foundation/options/utils/unset";
import { fileSchema } from "#project/config/config/schemas/values/fileSchema";
import { nodeMajorSchema } from "#project/config/config/schemas/values/nodeMajorSchema";
import {
  defaultBinDirectories,
  disabledCodeEnvironment,
} from "#project/config/constants";
import { declareCodeEnvironment } from "#project/environments/config/declareCodeEnvironment";
import type { ConfigContext } from "#project/config/types/ConfigContext";

export const binSchema = declareObject(
  {
    ...declareCodeEnvironment("bin", defaultBinDirectories),
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
