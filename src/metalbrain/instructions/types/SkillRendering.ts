import type { Directory } from "#types/Directory";

export interface SkillRendering {
  directory: Directory;
  skill: string;
  files: readonly string[];
  shared: readonly string[];
  onSharedFile?: ((file: string) => void) | undefined;
}
