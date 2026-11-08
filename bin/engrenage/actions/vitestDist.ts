import { resolveVitestDistArguments } from "#tools/vitest/index";

export default function (args: string[]): readonly string[] {
  return resolveVitestDistArguments(args);
}
