import { resolvePrettierArguments } from "#tools/prettier/index";

export default function (args: string[]): readonly string[] {
  return resolvePrettierArguments(args);
}
