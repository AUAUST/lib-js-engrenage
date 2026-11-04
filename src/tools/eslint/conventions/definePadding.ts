import stylistic, {
  type UnprefixedRuleOptions,
} from "@stylistic/eslint-plugin";

import { create } from "@auaust/toolkit/object";

import { defineConvention } from "#eslint/conventions/defineConvention";
import type { Convention } from "#eslint/types/Convention";

const paddingRule = stylistic.rules["padding-line-between-statements"];

export function definePadding({
  message,
  paddings,
}: {
  message: string;
  paddings: UnprefixedRuleOptions["padding-line-between-statements"];
}): Convention {
  return defineConvention({
    rule: {
      meta: {
        type: "layout",
        fixable: "whitespace",
        docs: {
          description: message,
        },
        messages: {
          expectedBlankLine: message,
          unexpectedBlankLine: message,
        },
        schema: [],
      },
      create(context) {
        return paddingRule.create(
          create(context, {
            options: {
              value: paddings,
            },
          }),
        );
      },
    },
  });
}
