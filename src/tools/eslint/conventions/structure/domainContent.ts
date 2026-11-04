import { basename, dirname, matchesGlob } from "node:path";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { values } from "@auaust/toolkit/object";

import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling", "files.tests"],
  rule: (config) => {
    return defineStructureRule({
      config,
      description:
        "A domain holds only roles, sub-domains and namespaces, and a namespace only domains and namespaces.",
      messages: {
        domain:
          "A domain holds only role directories, sub-domains and the files of its roles; move this file into the role directory it belongs to.",
        namespace:
          "A namespace holds only domains and namespaces; move this file into a domain.",
      },
      create(context, { environment, node, relativePath }) {
        const fileRoles = flatMap(
          values(config[environment].roles.roles),
          ({ file }) => {
            return file === undefined ? [] : [file].flat();
          },
        );

        const isRoleFile =
          dirname(relativePath) === "." &&
          fileRoles.some((glob) => matchesGlob(basename(relativePath), glob));

        return {
          Program(program) {
            if (
              (node.kind === "domain" || node.kind === "namespace") &&
              !isRoleFile
            ) {
              context.report({ node: program, messageId: node.kind });
            }
          },
        };
      },
    });
  },
});
