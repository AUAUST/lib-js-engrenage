/**
 * A file path, absolute or relative to the base the API taking it states.
 */
export type File = (string & {}) | `${string}.${string}`;
