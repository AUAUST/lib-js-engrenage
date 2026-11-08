import { resolvePrettierCheckArguments } from "#tools/prettier/index";

export default function (args: string[]): readonly string[] {
  return resolvePrettierCheckArguments(args);
}
