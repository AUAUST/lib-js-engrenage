import {
  backlogCategoriesHeading,
  backlogTemplate,
  endMarker,
} from "#tools/agents/constants";
import { formatReferenceMarker } from "#tools/agents/utils/formatReferenceMarker";

/**
 * The backlog index: `title`, the template block, then the categories heading
 * followed by `categories`, its lines.
 */
export function formatBacklogIndex(
  title: string,
  categories: readonly string[],
): string {
  return [
    title,
    "",
    formatReferenceMarker(backlogTemplate),
    endMarker,
    "",
    backlogCategoriesHeading,
    ...categories,
  ].join("\n");
}
