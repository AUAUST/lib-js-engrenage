import type { Filesystem } from "#config/types/Filesystem";

export function hasConfigFile(filesystem: Filesystem, tool: string): boolean {
  return filesystem.glob(`${tool}.config.*`).length > 0;
}
