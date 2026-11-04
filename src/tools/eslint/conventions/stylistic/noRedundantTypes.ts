import { includes } from "@auaust/primitive-kit/arrays";

import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";
import type { ReportDescriptor } from "#tools/eslint/types/ReportDescriptor";

const inlineLiteralNodeTypes: readonly string[] = [
  "TSLiteralType",
  "TSTemplateLiteralType",
];

function isLiteralFromReference(descriptor: ReportDescriptor): boolean {
  return (
    "messageId" in descriptor &&
    descriptor.messageId === "literalOverridden" &&
    "node" in descriptor &&
    !includes(inlineLiteralNodeTypes, descriptor.node.type)
  );
}

export default defineConvention({
  delegates: [
    delegateRule("@typescript-eslint/no-redundant-type-constituents", [], {
      name: "no-redundant-types",
      ignoreReport: isLiteralFromReference,
    }),
  ],
  files: ["files.code.published", "files.code.private"],
  typeAware: true,
  severity: "info",
});
