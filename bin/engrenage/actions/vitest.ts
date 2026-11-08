import { resolveVitestArguments } from "#tools/vitest/index";

export default function (args: string[]): readonly string[] {
  return resolveVitestArguments(args);
}
