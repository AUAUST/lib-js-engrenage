export interface LinkState {
  readonly short: string;
  readonly directory: string;
  readonly holds: boolean;
  readonly stale: boolean;
  readonly peers: readonly {
    readonly name: string;
    readonly installed: string;
    readonly linked: string;
  }[];
}
