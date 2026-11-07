import { basename, dirname, join, matchesGlob } from "node:path";

import { wrap } from "@auaust/primitive-kit/arrays";

import { relativeWithin } from "#foundation/filesystem/index";
import { indexRoleName } from "#project/roles/constants";
import { entitiesSection, structureSection } from "#project/structure/index";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling", "files.tests"],
  sections: { entities: entitiesSection, structure: structureSection },
  rule: ({ entities, structure: structures }, { root }) => {
    return defineStructureRule({
      entities,
      description:
        "A file in a role directory follows the role's nesting, categories and accepted files; a strict role holds at its root only the files its nested roles name.",
      messages: {
        nesting:
          "The role {{role}} allows {{depth}} levels of directories; move this file up.",
        category:
          "The role {{role}} sorts its modules into category directories; move this file into one.",
        accepts:
          "The role {{role}} accepts only {{accepts}}; move this file out.",
        strict:
          "The strict role {{role}} accepts at its root only {{accepts}}; rename this file or move it into a nested role's directory.",
      },
      create(context, { environment, kind, role, contract, path, fileRole }) {
        if (
          environment === "data" ||
          environment === "dist" ||
          environment === "workspace" ||
          kind !== "role" ||
          role === undefined ||
          contract === undefined
        ) {
          return {};
        }

        const structure = structures[environment];

        const relativePath = relativeWithin(join(root, path), context.filename);

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
            } else if (!isIndex && contract.strict && depth === 0) {
              const accepted = (contract.roles ?? []).flatMap((name) => {
                return wrap(structure?.roles[name]?.contract.file ?? []);
              });

              context.report({
                node: program,
                messageId: "strict",
                data: {
                  role,
                  accepts:
                    accepted.length === 0 ? "no file" : accepted.join(", "),
                },
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
