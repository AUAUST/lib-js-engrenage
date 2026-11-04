export function readDeclaredVersion(specifier: string): string | undefined {
  return /^[\^~=]?(\d+\.\d+\.\d+)$/.exec(specifier)?.[1];
}
