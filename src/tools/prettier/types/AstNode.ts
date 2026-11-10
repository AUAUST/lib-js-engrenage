export interface AstNode {
  readonly type: string;
  readonly [property: string]: unknown;
}
