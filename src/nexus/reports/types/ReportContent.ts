import type { LineEntry } from "#nexus/reports/types/LineEntry";
import type { ListEntry } from "#nexus/reports/types/ListEntry";
import type { StackEntry } from "#nexus/reports/types/StackEntry";
import type { TableEntry } from "#nexus/reports/types/TableEntry";
import type { TitleEntry } from "#nexus/reports/types/TitleEntry";
import type { TreeEntry } from "#nexus/reports/types/TreeEntry";

/**
 * An entry a command reports at any level.
 */
export type ReportContent =
  | LineEntry
  | TitleEntry
  | ListEntry
  | TableEntry
  | TreeEntry
  | StackEntry;
