/**
 * A glob pattern, matched against paths relative to the base the API taking it
 * states.
 */
export type Glob = (string & {}) | `${string}*${string}`;
