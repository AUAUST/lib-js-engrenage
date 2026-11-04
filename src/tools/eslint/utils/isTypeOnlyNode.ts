export function isTypeOnlyNode(node: object): boolean {
  return (
    ("exportKind" in node && node.exportKind === "type") ||
    ("importKind" in node && node.importKind === "type")
  );
}
