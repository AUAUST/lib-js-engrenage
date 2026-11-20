/**
 * A budget warning given to an agent: when, and the context it had gained.
 */
export interface BudgetWarning {
  readonly time: string;
  readonly gain: number;
}
