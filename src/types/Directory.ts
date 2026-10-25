export type Directory = (string & {}) | `${string}/${string}`;

export type Directories = ReadonlyArray<Directory>;
