import { isPlainObject } from "@auaust/toolkit";

function readObject(value: unknown): Record<string, unknown> {
  return isPlainObject(value) ? value : {};
}

export function withSourceRuntime(
  input: Record<string, unknown> = {},
): Record<string, unknown> {
  if (input.src === false) {
    return input;
  }

  const environments = readObject(input.environments);
  const source = readObject(environments.src);
  const execution = readObject(source.execution);

  if (execution.syntax !== undefined || execution.globals !== undefined) {
    return input;
  }

  return {
    ...input,
    environments: {
      ...environments,
      src: {
        ...source,
        execution: { ...execution, syntax: "2026-10" },
      },
    },
  };
}
