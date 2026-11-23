/**
 * The file names a domain of the top-level namespace uses for its surface
 * (`index`) and its package entry (`entry`), `entryFile` being `undefined` when
 * the namespace has no entrypoint role.
 *
 * @experimental
 */
export interface NamespaceFileNames {
  readonly indexFile: string;
  readonly entryFile: string | undefined;
}
