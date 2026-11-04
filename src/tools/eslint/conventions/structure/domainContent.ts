import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";
import { isRoleFile } from "#tools/eslint/utils/isRoleFile";

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling", "files.tests"],
  rule: (config) => {
    return defineStructureRule({
      config,
      description:
        "A domain holds only roles, sub-domains and namespaces, and a namespace only domains and namespaces; a command group also holds command modules.",
      messages: {
        domain:
          "A domain holds only role directories, sub-domains and the files of its roles; move this file into the role directory it belongs to.",
        namespace:
          "A namespace holds only domains and namespaces; move this file into a domain.",
      },
      create(context, location) {
        const { node } = location;
        const isRoleFileHere = isRoleFile(config, location);

        return {
          Program(program) {
            if (
              (node.kind === "domain" || node.kind === "namespace") &&
              node.commands !== true &&
              !isRoleFileHere
            ) {
              context.report({ node: program, messageId: node.kind });
            }
          },
        };
      },
    });
  },
});
