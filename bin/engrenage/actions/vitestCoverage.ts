import { resolveVitestCoverageArguments } from "#tools/vitest/index";

export default function (args: string[]): readonly string[] {
  return resolveVitestCoverageArguments(args);
}
