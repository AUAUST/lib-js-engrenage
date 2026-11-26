import { registerHooks } from "node:module";

import { hasNodeCondition } from "#foundation/processes/index";
import { sourceCondition } from "#project/package/constants";

/**
 * Switches the `source` condition on for the current process and the ones it
 * starts, unless it already is.
 */
export function enableSourceCondition(): void {
  if (hasNodeCondition(sourceCondition)) {
    return;
  }

  registerHooks({
    resolve(specifier, context, next) {
      return next(
        specifier,
        context.conditions?.includes(sourceCondition)
          ? context
          : {
              ...context,
              conditions: [...(context.conditions ?? []), sourceCondition],
            },
      );
    },
  });

  process.env.NODE_OPTIONS = [
    process.env.NODE_OPTIONS,
    `--conditions=${sourceCondition}`,
  ]
    .filter(Boolean)
    .join(" ");
}
