import type { Filesystem } from "#foundation/filesystem/index";

export function hasConfigFile(filesystem: Filesystem, tool: string): boolean {
  return filesystem.glob(`${tool}.config.*`).length > 0;
}
