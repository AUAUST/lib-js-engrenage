export function parseMajorVersion(specifier: string): number | undefined {
  const major = /\d+/.exec(specifier)?.[0];

  return major === undefined ? undefined : Number(major);
}
