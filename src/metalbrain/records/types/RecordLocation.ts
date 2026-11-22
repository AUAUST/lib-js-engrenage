import type { Directory } from "#types/Directory";

/**
 * Where a record kind stores its entries: a directory of `<group>.yml` files,
 * each with its `purpose`, beside the generated `index.yml`.
 */
export interface RecordLocation {
  readonly directory: Directory;
}
