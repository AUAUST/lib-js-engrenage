import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

/**
 * Where a record kind stores its entries: a directory of `<group>.yml` files,
 * each with its `purpose`, beside the generated `index.yml`; or one file holding
 * the kind's only group, named after the kind, without a purpose or index.
 */
export type RecordLocation =
  | { readonly directory: Directory }
  | { readonly file: File };
