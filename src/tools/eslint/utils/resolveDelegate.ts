import type { Rule } from "eslint";

import { includes } from "@auaust/primitive-kit/arrays";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { max } from "@auaust/toolkit/math";
import { create, entries } from "@auaust/toolkit/object";

import { findUpstreamRule } from "#tools/eslint/utils/findUpstreamRule";
import type { Delegate } from "#tools/eslint/ports/Delegate";
import type { ReportDescriptor } from "#tools/eslint/types/ReportDescriptor";
import type { RuleModule } from "#tools/eslint/types/RuleModule";

function mergeOption(defaults: unknown, override: unknown): unknown {
  if (override === undefined) {
    return defaults;
  }

  if (!isPlainObject(defaults) || !isPlainObject(override)) {
    return override;
  }

  const merged: Record<string, unknown> = {
    ...defaults,
  };

  for (const [key, value] of entries(override)) {
    merged[key] = mergeOption(defaults[key], value);
  }

  return merged;
}

function wrapReports(
  rule: RuleModule,
  ignoredMessages: readonly string[],
  ignoreReport?: (
    descriptor: ReportDescriptor,
    context: Rule.RuleContext,
  ) => boolean,
  fix?: (
    descriptor: ReportDescriptor,
    context: Rule.RuleContext,
  ) => Rule.ReportFixer | null,
): RuleModule["create"] {
  for (const messageId of ignoredMessages) {
    if (rule.meta?.messages?.[messageId] === undefined) {
      throw new Error(`Unknown message "${messageId}" to ignore`);
    }
  }

  if (
    ignoredMessages.length === 0 &&
    ignoreReport === undefined &&
    fix === undefined
  ) {
    return rule.create;
  }

  return (context) => {
    return rule.create(
      create(context, {
        report: {
          value(descriptor: ReportDescriptor) {
            if (
              ("messageId" in descriptor &&
                includes(ignoredMessages, descriptor.messageId)) ||
              ignoreReport?.(descriptor, context) === true
            ) {
              return;
            }

            context.report(
              fix === undefined
                ? descriptor
                : {
                    ...descriptor,
                    fix: fix(descriptor, context),
                  },
            );
          },
        },
      }),
    );
  };
}

export function resolveDelegate({
  upstream,
  options,
  ignoredMessages = [],
  ignoreReport,
  fix,
}: Delegate): RuleModule {
  const rule = findUpstreamRule(upstream);

  const upstreamDefaults: readonly unknown[] = rule.meta?.defaultOptions ?? [];

  const defaultOptions = Array.from(
    {
      length: max(upstreamDefaults.length, options.length),
    },
    (_, index) => {
      return mergeOption(upstreamDefaults[index], options[index]);
    },
  );

  return {
    ...rule,
    meta: {
      ...rule.meta,
      defaultOptions,
      ...(fix === undefined
        ? {}
        : {
            fixable: "code",
          }),
    },
    create: wrapReports(rule, ignoredMessages, ignoreReport, fix),
  };
}
