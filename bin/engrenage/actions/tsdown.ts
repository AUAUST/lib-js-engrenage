import { resolveTsdownArguments } from "#tools/tsdown/index";

export default function (args: string[]): readonly string[] {
  return resolveTsdownArguments(args);
}
