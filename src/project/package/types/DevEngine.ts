/**
 * A tool a `devEngines` entry of the package manifest requires, such as the
 * package manager; `onFail` is kept as written.
 */
export interface DevEngine {
  name: string;
  version?: string | undefined;
  onFail?: string | undefined;
}
