import type { ReportText } from "#nexus/reports/types/ReportText";

/**
 * A tree node: its label and the nodes it holds.
 */
export interface TreeNode {
  readonly label: ReportText;
  readonly children: readonly TreeNode[];
}
