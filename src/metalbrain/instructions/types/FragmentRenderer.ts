import type { SkillRendering } from "#metalbrain/instructions/types/SkillRendering";
import type { File } from "#types/File";

export interface FragmentRenderer {
  render(body: string, source: File, skill?: SkillRendering): Promise<string>;
}
