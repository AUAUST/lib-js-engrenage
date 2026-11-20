// @debt restates `isMissingError` of `foundation/filesystem`, kept out so the hook loads only Node builtins
export function isMissingFile(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
