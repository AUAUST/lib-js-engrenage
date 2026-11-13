/**
 * Reads the `major.minor.patch` of a specifier that is exactly one version,
 * optionally prefixed with `^`, `~` or `=`; `undefined` for any other specifier.
 */
export function readDeclaredVersion(specifier: string): string | undefined {
  return /^[\^~=]?(\d+\.\d+\.\d+)$/.exec(specifier)?.[1];
}
