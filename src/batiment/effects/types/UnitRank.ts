export interface UnitRank {
  readonly level: string | undefined;
  readonly evaluation: string | undefined;
  readonly members: ReadonlyMap<string, string>;
}
