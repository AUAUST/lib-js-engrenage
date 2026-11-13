import type { File } from "#types/File";

/**
 * One export statement of a barrel from `file`: `export { binding as name }`, or
 * `export * as name` without `binding`, `export type` when `typeOnly`; `name`
 * defaults to `binding`.
 *
 * @experimental
 */
export interface BarrelExport {
  readonly file: File;
  readonly binding?: string;
  readonly name?: string;
  readonly typeOnly?: boolean;
}
