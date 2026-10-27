// c12 type-imports its optional peer giget, which engrenage never installs.
declare module "giget" {
  export interface DownloadTemplateOptions {
    [option: string]: unknown;
  }
}

// eslint-import-context type-imports type-fest without depending on it.
declare module "type-fest" {
  export type KebabCase<Value extends string> = Value;

  export type LiteralUnion<Literal, Base> =
    Literal | (Base & Record<never, never>);
}
