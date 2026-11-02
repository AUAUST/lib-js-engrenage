import { description, optional, pipe, record, string } from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { environmentSchema } from "#config/config/schemas/values/environmentSchema";
import { fileSchema } from "#config/config/schemas/values/fileSchema";
import { nodeMajorSchema } from "#config/config/schemas/values/nodeMajorSchema";
import { defaultBinDirectories } from "#config/constants";
import { createCodeEnvironment } from "#config/utils/createCodeEnvironment";

export const binSchema = pipe(
  environmentSchema({
    ...createCodeEnvironment("bin", defaultBinDirectories),
    commands: optional(
      pipe(
        record(string(), fileSchema),
        description(
          join(
            [
              "Commands the package exposes, mapped to their entry file.",
              "They feed the tsdown entries and the `bin` field of `package.json`.",
              "@default the entry files found in the bin directories",
            ],
            "\n",
          ),
        ),
      ),
    ),
    node: optional(
      pipe(
        nodeMajorSchema,
        description(
          join(
            [
              // @debt the "engines.node floor" claim was written from reading the code and not verified by running it
              "Node major the commands target: it feeds the `engines.node` floor of `package.json`.",
              "@default `runtime.node`",
            ],
            "\n",
          ),
        ),
      ),
    ),
  }),
  description(
    join(
      [
        "The environment of the command-line entries of the package.",
        "`false` disables it.",
      ],
      "\n",
    ),
  ),
);
