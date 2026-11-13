import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";
import type { Rule } from "eslint";

import { parseJsdoc, type JsdocTag } from "#foundation/jsdoc/index";
import { readDocTag, type TagDeclaration } from "#project/docs/index";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { findJsdocBlock } from "#tools/eslint/utils/findJsdocBlock";
import { isJsdocBlock } from "#tools/eslint/utils/isJsdocBlock";
import { readDocumentedSignature } from "#tools/eslint/utils/readDocumentedSignature";
import { readOverload } from "#tools/eslint/utils/readOverload";

type Range = readonly [start: number, end: number];

interface Documented {
  readonly parameters: Set<string>;
  readonly typeParameters: Set<string>;
  open: boolean;
}

interface OverloadGroup {
  readonly signatures: TSESTree.Node[];
  implementation?: TSESTree.Node;
}

const documentedSelector = [
  AST_NODE_TYPES.FunctionDeclaration,
  AST_NODE_TYPES.TSDeclareFunction,
  AST_NODE_TYPES.FunctionExpression,
  AST_NODE_TYPES.ArrowFunctionExpression,
  AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
  AST_NODE_TYPES.TSMethodSignature,
  AST_NODE_TYPES.TSCallSignatureDeclaration,
  AST_NODE_TYPES.TSConstructSignatureDeclaration,
  AST_NODE_TYPES.TSFunctionType,
  AST_NODE_TYPES.ClassDeclaration,
  AST_NODE_TYPES.TSInterfaceDeclaration,
  AST_NODE_TYPES.TSTypeAliasDeclaration,
].join(", ");

const messages = {
  invalid: "{{message}}",
  duplicate: "@{{name}} appears more than once in this block, but its declaration is not `multiple`.",
  excluded: "@{{name}} cannot appear in the same block as @{{other}}.",
  unknownSubject: "@{{name}} names `{{subject}}`, which is no {{kind}} of the documented declaration.",
  exportScope: "@{{name}} states one fact about the export: write it on the first documented overload only.",
  implementation: "Document the overload signatures instead: consumers never see the block on the implementation of an overloaded function.",
};

function createChecker(
  context: Rule.RuleContext,
  declarations: readonly TagDeclaration[],
) {
  const { sourceCode } = context;

  const byName = new Map(declarations.map((tag) => [tag.name, tag] as const));
  const documented = new Map<number, Documented>();
  const groups = new Map<string, OverloadGroup>();
  const blocks = new Map<TSESTree.Node, Range>();
  const parsed = new Map<number, readonly JsdocTag[]>();

  function report(
    range: Range,
    messageId: keyof typeof messages,
    data: Record<string, string> = {},
  ) {
    context.report({
      loc: {
        start: sourceCode.getLocFromIndex(range[0]),
        end: sourceCode.getLocFromIndex(range[1]),
      },
      messageId,
      data,
    });
  }

  function readTags(block: Range): readonly JsdocTag[] {
    const known = parsed.get(block[0]);

    if (known !== undefined) {
      return known;
    }

    const {
      tags,
    } = parseJsdoc(sourceCode.text.slice(block[0], block[1]), block[0]);

    parsed.set(block[0], tags);

    return tags;
  }

  function document(
    block: Range,
    parameters: readonly string[] | undefined,
    typeParameters: readonly string[],
  ) {
    const entry: Documented = (
      documented.get(block[0]) ?? {
        parameters: new Set(),
        typeParameters: new Set(),
        open: false,
      }
    );

    entry.open ||= parameters === undefined;

    for (const name of parameters ?? []) {
      entry.parameters.add(name);
    }

    for (const name of typeParameters) {
      entry.typeParameters.add(name);
    }

    documented.set(block[0], entry);
  }

  function group(holder: TSESTree.Node) {
    const overload = readOverload(holder);

    if (overload === undefined) {
      return;
    }

    const groupKey = `${holder.parent?.range.join(":")} ${overload.key}`;
    const found = groups.get(groupKey) ?? { signatures: [] };

    if (overload.implementation) {
      found.implementation = holder;
    } else {
      found.signatures.push(holder);
    }

    groups.set(groupKey, found);
  }

  function visit(node: TSESTree.Node) {
    const signature = readDocumentedSignature(node);

    if (signature === undefined) {
      return;
    }

    const { holder, parameters, typeParameters } = signature;

    const block = findJsdocBlock(sourceCode, holder)?.range;

    if (block !== undefined) {
      blocks.set(holder, block);
      document(block, parameters, typeParameters);
    }

    group(holder);
  }

  function checkSubject(tag: JsdocTag, subject: string, block: Range) {
    const kind = byName.get(tag.name)?.subject;

    if (kind !== "parameter" && kind !== "typeParameter") {
      return;
    }

    const entry = documented.get(block[0]);

    if (kind === "parameter" && entry?.open === true) {
      return;
    }

    const names = kind === "parameter"
      ? entry?.parameters
      : entry?.typeParameters;

    const [root = subject] = subject.split(".", 1);

    if (names?.has(root.replace(/\[\]$/, "")) !== true) {
      report(tag.range, "unknownSubject", {
        name: tag.name,
        subject,
        kind: kind === "parameter" ? "parameter" : "type parameter",
      });
    }
  }

  function findExcluded(tags: readonly JsdocTag[], tag: JsdocTag) {
    const excludes = byName.get(tag.name)?.excludes ?? [];

    return tags.find(({ name }) => {
      return (
        name !== tag.name &&
        (excludes.includes(name) ||
          byName.get(name)?.excludes?.includes(tag.name) === true)
      );
    });
  }

  function checkBlock(block: Range) {
    const tags = readTags(block);

    const seen = new Set<string>();

    for (const [index, tag] of tags.entries()) {
      const read = readDocTag(declarations, tag);

      if (!read.ok) {
        report(tag.range, "invalid", { message: read.message });

        continue;
      }

      if (seen.has(tag.name) && byName.get(tag.name)?.multiple !== true) {
        report(tag.range, "duplicate", { name: tag.name });
      }

      seen.add(tag.name);

      const excluded = findExcluded(tags.slice(0, index), tag);

      if (excluded !== undefined) {
        report(tag.range, "excluded", { name: tag.name, other: excluded.name });
      }

      if (read.tag.subject !== undefined) {
        checkSubject(tag, read.tag.subject, block);
      }
    }
  }

  function checkOverloads({ signatures, implementation }: OverloadGroup) {
    const implementationBlock = implementation === undefined
      ? undefined
      : blocks.get(implementation);

    if (signatures.length > 0 && implementationBlock !== undefined) {
      report(implementationBlock, "implementation");
    }

    const documentedBlocks = signatures
      .map((signature) => blocks.get(signature))
      .filter((block) => block !== undefined);

    for (const block of documentedBlocks.slice(1)) {
      for (const tag of readTags(block)) {
        if (byName.get(tag.name)?.scope === "export") {
          report(tag.range, "exportScope", { name: tag.name });
        }
      }
    }
  }

  function finish() {
    for (const comment of sourceCode.getAllComments()) {
      if (isJsdocBlock(comment) && comment.range !== undefined) {
        checkBlock(comment.range);
      }
    }

    for (const found of groups.values()) {
      checkOverloads(found);
    }
  }

  return { visit, finish };
}

export default defineConvention({
  sections: { docs: "docs" },
  rule({ docs }) {
    return {
      meta: {
        type: "problem",
        docs: {
          description: "Doc tags are declared, well formed, used once unless `multiple`, never alongside a tag they exclude, and name the documented declaration's parameters.",
        },
        messages,
        schema: [],
      },
      create(context) {
        const { visit, finish } = createChecker(context, docs.tags);

        return {
          [documentedSelector](node: Rule.Node) {
            // @debt ESLint types its AST as ESTree, without the TypeScript nodes the parser produces
            visit(node as unknown as TSESTree.Node);
          },
          "Program:exit"() {
            finish();
          },
        };
      },
    };
  },
});
