import type { Command, OptionValues } from "@commander-js/extra-typings";

import type { CommandParameters } from "#workflows/cli/types/CommandParameters";

export type DefaultActionParameters<Configured> =
  Configured extends Command<infer Arguments, infer Options, OptionValues>
    ? [Arguments, keyof Options] extends [[], never]
      ? []
      : CommandParameters<Configured>
    : never;
