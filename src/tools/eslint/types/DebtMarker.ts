/**
 * A debt marker found by the debt marker rule: its file relative to the project
 * root, its one-based line and column, and its statement.
 */
export interface DebtMarker {
  file: string;
  line: number;
  column: number;
  statement: string;
}
