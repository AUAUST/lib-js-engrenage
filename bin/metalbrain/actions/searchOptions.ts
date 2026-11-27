import {
  CommandUsageError,
  option,
  type OptionDeclaration,
} from "#nexus/cli/index";

function parseCount(minimum: number) {
  return (value: string) => {
    const count = Number(value);

    if (!Number.isInteger(count) || count < minimum) {
      throw new CommandUsageError(`Expected an integer of ${minimum} or more.`);
    }

    return count;
  };
}

export default function (): readonly OptionDeclaration[] {
  return [
    option({
      name: "text",
      type: "string",
      placeholder: "raw",
      description: "raw text to search, such as a command or a draft entry, instead of a query",
    }),
    option({
      name: "limit",
      type: "string",
      placeholder: "count",
      description: "the most entries printed",
      default: 10,
      parse: parseCount(1),
    }),
    option({
      name: "offset",
      type: "string",
      placeholder: "count",
      description: "the number of ranked entries skipped",
      default: 0,
      parse: parseCount(0),
    }),
  ];
}
