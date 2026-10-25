export type Glob = (string & {}) | `${string}*${string}`;

export type Globs = ReadonlyArray<Glob>;
