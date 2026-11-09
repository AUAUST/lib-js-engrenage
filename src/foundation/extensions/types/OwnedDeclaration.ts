export interface OwnedDeclaration<Extension, Declaration> {
  readonly key: string;
  readonly declaration: Declaration;
  readonly owner: Extension;
}
