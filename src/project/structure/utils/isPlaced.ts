export function isPlaced(
  placement: boolean | "root",
  atRoot: boolean,
): boolean {
  return placement === true || (placement === "root" && atRoot);
}
