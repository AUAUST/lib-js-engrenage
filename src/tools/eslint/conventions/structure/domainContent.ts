import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling", "files.tests"],
  sections: { entities: "entities" },
  rule: ({ entities }) => {
    return defineStructureRule({
      entities,
      description: "A domain holds only roles, sub-domains and namespaces, and a namespace only domains and namespaces; a command group also holds command modules.",
      messages: {
        domain: "A domain holds only role directories, sub-domains and the files of its roles; move this file into the role directory it belongs to.",
        namespace: "A namespace holds only domains and namespaces; move this file into a domain.",
      },
      create(context, { kind, commands, fileRole }) {
        return {
          Program(program) {
            if (
              (kind === "domain" || kind === "namespace") &&
              !commands &&
              fileRole === undefined
            ) {
              context.report({ node: program, messageId: kind });
            }
          },
        };
      },
    });
  },
});
