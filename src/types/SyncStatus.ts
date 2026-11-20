// @debt a domain contract held as a global type; belongs to the lowest domain owning it
/**
 * What a sync did to a file: `created`, `synced` (updated) or `deleted`;
 * `outdated` when a check finds it would change it.
 */
export type SyncStatus = "created" | "synced" | "outdated" | "deleted";
