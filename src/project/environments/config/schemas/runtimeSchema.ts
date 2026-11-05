import { engrenage } from "#constants";
import { declare } from "#foundation/options/utils/declare";
import { declareObject } from "#foundation/options/utils/declareObject";
import { nodeMajorSchema } from "#project/baseline/index";

import manifest from "#package.json" with { type: "json" };

export const runtimeSchema = declareObject(
  {
    node: declare(nodeMajorSchema, {
      description: [
        "Node major of the development tooling (tests, scripts, tooling files), checked against the known Node releases.",
        "It feeds `devEngines.runtime` of `package.json` and the Node types of those environments.",
      ],
      optional: {
        explain: "the Node major engrenage itself requires",
        compute() {
          const major = /\d+/.exec(manifest.engines.node)?.[0];

          if (major === undefined) {
            throw new Error(
              `${engrenage} declares no engines.node to default to`,
            );
          }

          return Number(major);
        },
      },
    }),
  },
  {
    optional: true,
  },
);
