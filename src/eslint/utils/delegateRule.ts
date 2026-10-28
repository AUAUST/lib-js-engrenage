import type { Rule } from "eslint";

import { includes } from "@auaust/primitive-kit/arrays";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { max } from "@auaust/toolkit/math";
import { create, entries } from "@auaust/toolkit/object";

import { findUpstreamRule } from "#eslint/utils/findUpstreamRule";
import type { Delegate } from "#eslint/types/Delegate";
import type { ReportDescriptor } from "#eslint/types/ReportDescriptor";
import type { RuleModule } from "#eslint/types/RuleModule";
import type { RuleOptions } from "#eslint/types/RuleOptions";
import type { Rules } from "#eslint/types/Rules";

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
  ignoredMessages: ReadonlyArray<string>,
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

export function delegateRule<Id extends keyof Rules & string>(
  upstream: Id,
  options?: RuleOptions<Id>,
  {
    name = upstream.slice(upstream.lastIndexOf("/") + 1),
    ignoredMessages = [],
    ignoreReport,
    fix,
  }: {
    name?: string;
    ignoredMessages?: ReadonlyArray<string>;
    ignoreReport?(
      descriptor: ReportDescriptor,
      context: Rule.RuleContext,
    ): boolean;
    fix?(
      descriptor: ReportDescriptor,
      context: Rule.RuleContext,
    ): Rule.ReportFixer | null;
  } = {},
): Delegate {
  const rule = findUpstreamRule(upstream);

  const upstreamDefaults: ReadonlyArray<unknown> =
    rule.meta?.defaultOptions ?? [];

  const overrides: ReadonlyArray<unknown> = options ?? [];

  const defaultOptions = Array.from(
    {
      length: max(upstreamDefaults.length, overrides.length),
    },
    (_, index) => {
      return mergeOption(upstreamDefaults[index], overrides[index]);
    },
  );

  return {
    name,
    upstream,
    rule: {
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
    },
  };
}
