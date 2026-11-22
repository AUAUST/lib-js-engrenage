import { backlogTemplate, endMarker } from "#tools/agents/constants";
import { formatReferenceMarker } from "#tools/agents/utils/formatReferenceMarker";

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
