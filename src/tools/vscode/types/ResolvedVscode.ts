/**
 * The resolved `vscode` config section: `undefined` leaves each file to its flag
 * and existence.
 */
export interface ResolvedVscode {
  readonly settings: boolean | undefined;
  readonly extensions: boolean | undefined;
}
