import { indexOf } from "@auaust/primitive-kit/arrays";

export function getOptionsEnd(args: readonly string[]): number {
  const end = indexOf(args, "--");

  return end === -1 ? args.length : end;
}
