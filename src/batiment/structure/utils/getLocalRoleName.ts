export function getLocalRoleName(name: string): string {
  return name.slice(name.lastIndexOf("/") + 1);
}
