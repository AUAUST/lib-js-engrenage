import { indexOf } from "@auaust/toolkit/array";

export function getOptionsEnd(args: readonly string[]): number {
  const end = indexOf(args, "--");

  return end === -1 ? args.length : end;
}
