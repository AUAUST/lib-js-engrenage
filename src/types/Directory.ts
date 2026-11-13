/**
 * A directory path, absolute or relative to the base the API taking it states.
 */
export type Directory = (string & {}) | `${string}/${string}`;
