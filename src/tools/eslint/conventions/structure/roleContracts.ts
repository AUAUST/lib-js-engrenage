import { basename, dirname, join, matchesGlob } from "node:path";

import { relativeWithin } from "#foundation/filesystem/index";
import { indexRoleName } from "#project/roles/constants";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling", "files.tests"],
  rule: (config) => {
    return defineStructureRule({
      config,
      description:
        "A file in a role directory follows the role's nesting, categories, index and accepted files.",
      messages: {
        nesting:
          "The role {{role}} allows {{depth}} levels of directories; move this file up.",
        category:
          "The role {{role}} sorts its modules into category directories; move this file into one.",
        index: "The role {{role}} holds no index.ts; remove it or move it out.",
        accepts:
          "The role {{role}} accepts only {{accepts}}; move this file out.",
      },
      create(context, { kind, role, contract, path, fileRole }) {
        if (kind !== "role" || role === undefined || contract === undefined) {
          return {};
        }

        const relativePath = relativeWithin(
          join(config.root, path),
          context.filename,
        );

        const file = basename(relativePath);
        const isIndex = fileRole === indexRoleName;

        const depth =
          dirname(relativePath) === "."
            ? 0
            : relativePath.split("/").length - 1;

        const allowed =
          contract.nesting === "any"
            ? Infinity
            : contract.nesting + (contract.categories === true ? 1 : 0);

        return {
          Program(program) {
            if (depth > allowed) {
              context.report({
                node: program,
                messageId: "nesting",
                data: { role, depth: String(allowed) },
              });
            } else if (
              contract.categories === true &&
              depth === 0 &&
              !(isIndex && contract.index)
            ) {
              context.report({
                node: program,
                messageId: "category",
                data: { role },
              });
            } else if (isIndex && !contract.index) {
              context.report({
                node: program,
                messageId: "index",
                data: { role },
              });
            } else if (
              !isIndex &&
              contract.accepts !== undefined &&
              ![contract.accepts].flat().some((glob) => matchesGlob(file, glob))
            ) {
              context.report({
                node: program,
                messageId: "accepts",
                data: { role, accepts: [contract.accepts].flat().join(", ") },
              });
            }
          },
        };
      },
    });
  },
});
