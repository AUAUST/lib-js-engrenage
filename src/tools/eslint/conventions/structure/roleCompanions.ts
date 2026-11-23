import { globSync } from "node:fs";
import { basename, extname } from "node:path";

import { indexRoleName } from "#batiment/roles/constants";
import { fillRolePlaceholders } from "#batiment/roles/index";
import { relativeWithin } from "#foundation/filesystem/index";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling", "files.tests"],
  sections: { entities: "entities" },
  rule: ({ entities }, { root }) => {
    return defineStructureRule({
      entities,
      description: "A module of a role with `companions` has a file matching each of them.",
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

        const missing = fillRolePlaceholders(
          companions,
          location,
          basename(file, extname(file)),
        ).filter((companion) => {
          return globSync(companion, { cwd: root }).length === 0;
        });

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
