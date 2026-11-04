export function createFileCategory(role: string): string {
  return role.replaceAll(/\W+/g, "-").replaceAll(/^-|-$/g, "");
}
