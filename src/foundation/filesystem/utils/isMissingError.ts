import { get } from "@auaust/toolkit/object";

export function isMissingError(error: unknown): boolean {
  const code = error instanceof Error ? get(error, "code") : undefined;

  return code === "ENOENT" || code === "ENOTDIR";
}
