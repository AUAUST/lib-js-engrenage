/**
 * A thoroughness warning given to an agent: when, and the context it had gained.
 */
export interface ThoroughnessWarning {
  readonly time: string;
  readonly gain: number;
}
