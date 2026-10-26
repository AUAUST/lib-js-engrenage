export function isOptionOf(arg: string, options: readonly string[]): boolean {
  return options.some((option) => {
    return arg === option || arg.startsWith(`${option}=`);
  });
}
