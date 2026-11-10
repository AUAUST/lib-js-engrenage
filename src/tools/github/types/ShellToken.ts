// @debt restates the part of shell-quote's `ParseEntry` the domain reads, only because shell-quote's CommonJS declarations cannot be bundled into the package's declarations
export type ShellToken =
  | string
  | { readonly op: string }
  | { readonly comment: string };
