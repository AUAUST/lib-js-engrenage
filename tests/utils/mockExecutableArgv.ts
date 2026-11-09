import { getExecutable } from "#tests/utils/getExecutable";

export function mockExecutableArgv(): () => void {
  const argv = process.argv;

  process.argv = [argv[0] ?? "node", getExecutable()];

  return function restoreArgv() {
    process.argv = argv;
  };
}
