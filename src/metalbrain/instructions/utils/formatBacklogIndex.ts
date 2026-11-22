import { backlogTemplate, endMarker } from "#metalbrain/instructions/constants";
import { formatReferenceMarker } from "#metalbrain/instructions/utils/formatReferenceMarker";

/**
 * The backlog index page: `title`, then the template block.
 */
export function formatBacklogIndex(title: string): string {
  return [
    title,
    "",
    formatReferenceMarker(backlogTemplate),
    endMarker,
    "",
  ].join("\n");
}
