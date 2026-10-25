export type File = (string & {}) | `${string}.${string}`;

export type Files = ReadonlyArray<File>;
