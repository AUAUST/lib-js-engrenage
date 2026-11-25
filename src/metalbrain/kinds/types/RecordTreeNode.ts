/**
 * One line of a record tree and the lines it holds.
 */
export interface RecordTreeNode {
  readonly line: string;
  readonly children: readonly RecordTreeNode[];
}
