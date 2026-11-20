/**
 * The file names a domain of the environment uses for its surface (`index`) and
 * its package entry (`entry`), `entryFile` being `undefined` when the environment
 * has no entrypoint role.
 *
 * @experimental
 */
export interface EnvironmentFileNames {
  readonly indexFile: string;
  readonly entryFile: string | undefined;
}
