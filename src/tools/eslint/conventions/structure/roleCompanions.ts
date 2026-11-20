import { existsSync } from "node:fs";
import { basename, extname, join } from "node:path";

import { toArray } from "@auaust/toolkit/array";

import { indexRoleName } from "#batiment/roles/constants";
import { relativeWithin } from "#foundation/filesystem/index";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling", "files.tests"],
  sections: { entities: "entities" },
  rule: ({ entities }, { root }) => {
    return defineStructureRule({
      entities,
      description: "A module of a role with `companions` has each file they name.",
      messages: {
        missing: "The {{role}} role requires {{companion}} for this module; create it.",
      },
      create(context, { role, fileRole, contract, location }) {
        const companions = contract?.companions;

        if (
          role === undefined ||
          companions === undefined ||
          fileRole === indexRoleName
        ) {
          return {};
        }

        const file = relativeWithin(root, context.filename);

        const missing = toArray(
          companions.resolve({
            file,
            name: basename(file, extname(file)),
            location,
          }),
        ).filter((companion) => !existsSync(join(root, companion)));

        return {
          Program() {
            for (const companion of missing) {
              context.report({
                loc: { line: 1, column: 0 },
                messageId: "missing",
                data: { role, companion },
              });
            }
          },
        };
      },
    });
  },
});
