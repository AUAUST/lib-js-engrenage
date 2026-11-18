import type { Directory } from "#types/Directory";

/**
 * A checkout a project links a registered repository's package to, read at `HEAD`.
 */
export interface LinkedCheckout {
  readonly directory: Directory;
}
