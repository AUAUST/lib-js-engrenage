import type { Command, OptionValues } from "@commander-js/extra-typings";

export type CommandParameters<Configured> = Configured extends Command<
  infer Arguments,
  infer Options,
  OptionValues
>
  ? [...Arguments, Options, Configured]
  : never;
