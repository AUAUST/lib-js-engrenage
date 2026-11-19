export interface LinkState {
  readonly short: string;
  readonly directory: string;
  readonly present: boolean;
  readonly holds: boolean;
  readonly stale: boolean;
  readonly peers: readonly {
    readonly name: string;
    readonly installed: string;
    readonly linked: string;
  }[];
}
