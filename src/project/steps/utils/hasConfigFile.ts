import type { Filesystem } from "#foundation/filesystem/types/Filesystem";

export function hasConfigFile(filesystem: Filesystem, tool: string): boolean {
  return filesystem.glob(`${tool}.config.*`).length > 0;
}
