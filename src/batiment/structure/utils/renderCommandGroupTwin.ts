import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function renderCommandGroupTwin({
  path,
  twin,
}: {
  path: Directory;
  twin: File;
}): string {
  return `${twin} sits beside the command group ${path}; move it into the group or rename one of them.`;
}
