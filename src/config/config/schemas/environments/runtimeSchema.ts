import { description, optional, pipe, strictObject } from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { nodeMajorSchema } from "#config/config/schemas/values/nodeMajorSchema";

export const runtimeSchema = strictObject({
  node: optional(
    pipe(
      nodeMajorSchema,
      description(
        join(
          [
            "Node major of the development tooling (tests, scripts, tooling files), checked against the known Node releases.",
            "It feeds `devEngines.runtime` of `package.json` and the Node types of those environments.",
            "@default the Node major engrenage itself requires",
          ],
          "\n",
        ),
      ),
    ),
  ),
});
