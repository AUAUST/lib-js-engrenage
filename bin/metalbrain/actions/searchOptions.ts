import {
  InvalidArgumentError,
  Option,
  type CommandUnknownOpts,
} from "@commander-js/extra-typings";

function parseCount(minimum: number) {
  return (value: string) => {
    const count = Number(value);

    if (!Number.isInteger(count) || count < minimum) {
      throw new InvalidArgumentError(
        `Expected an integer of ${minimum} or more.`,
      );
    }

    return count;
  };
}

export default function (command: CommandUnknownOpts): void {
  command
    .addOption(
      new Option(
        "--text <raw>",
        "search raw text, such as a command or a draft entry, as a text query instead of the query syntax: its backtick spans and tokens holding `/`, `.`, `_`, `-` or `#` as phrases, its other words without stopwords, entries matching two of them",
      ),
    )
    .addOption(
      new Option("--limit <count>", "the most entries printed")
        .argParser(parseCount(1))
        .default(10),
    )
    .addOption(
      new Option("--offset <count>", "the number of ranked entries skipped")
        .argParser(parseCount(0))
        .default(0),
    );
}
