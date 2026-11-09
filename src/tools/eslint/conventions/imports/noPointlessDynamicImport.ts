import { packageJsonSection } from "#project/package/index";
import {
  entitiesSection,
  importResolverSection,
  structureSection,
} from "#project/structure/index";
import { analyzeImports } from "#tools/eslint/utils/analyzeImports";
import { createRuleMeta } from "#tools/eslint/utils/createRuleMeta";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { isTypeOnlyNode } from "#tools/eslint/utils/isTypeOnlyNode";

export default defineConvention({
  files: ["files.code.published", "files.scripts"],
  sections: {
    structure: structureSection,
    entities: entitiesSection,
    resolveImport: importResolverSection,
    packageJson: packageJsonSection,
  },
  rule: ({ packageJson, ...graph }) => {
    const optionalPeers = new Set(packageJson.optional.optionalPeers);

    return {
      meta: createRuleMeta({
        description:
          "A dynamic import() targets a lazy role or an optional peer, computes its specifier only in a discovered role, and is the only one of its function.",
        messages: {
          target:
            "`{{specifier}}` is neither a lazy role nor an optional peer; import it statically or move the rare path into a lazy role.",
          computed: "Only a discovered role may compute an import() specifier.",
          repeated:
            "This function already has an import(); load everything through one lazy module.",
          imported:
            "`{{specifier}}` is already imported statically; use that binding.",
        },
      }),
      create(context) {
        const { sourceCode } = context;
        const analysis = analyzeImports(graph, context);
        const lazyFunctions = new Set<object>();

        // @debt reports only modules this file imports directly, while a target reachable through its static graph is just as pointless
        const staticSources = new Set(
          sourceCode.ast.body.flatMap((statement) => {
            return statement.type === "ImportDeclaration" &&
              !isTypeOnlyNode(statement)
              ? [statement.source.value]
              : [];
          }),
        );

        return {
          ImportExpression(node) {
            const { block } = sourceCode.getScope(node).variableScope;

            if (block.type !== "Program") {
              if (lazyFunctions.has(block)) {
                context.report({ node, messageId: "repeated" });
              }

              lazyFunctions.add(block);
            }

            if (node.source.type !== "Literal") {
              if (
                graph.entities.entityOf(context.filename)?.contract
                  ?.discovered !== true
              ) {
                context.report({ node, messageId: "computed" });
              }

              return;
            }

            const specifier = String(node.source.value);

            if (staticSources.has(specifier)) {
              return void context.report({
                node,
                messageId: "imported",
                data: { specifier },
              });
            }

            const { target, resolved } = analysis.edgeOf(node, specifier);

            if (
              target?.contract?.lazy !== true &&
              (resolved?.kind !== "package" || !optionalPeers.has(resolved.name))
            ) {
              context.report({
                node,
                messageId: "target",
                data: { specifier },
              });
            }
          },
        };
      },
    };
  },
});
