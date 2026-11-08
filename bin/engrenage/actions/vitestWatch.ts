import { resolveVitestWatchArguments } from "#tools/vitest/index";

export default function (args: string[]): readonly string[] {
  return resolveVitestWatchArguments(args);
}
