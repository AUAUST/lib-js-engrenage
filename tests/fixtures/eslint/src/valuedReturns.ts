export function guarded(value: string | undefined) {
  if (value === undefined) {
    return;
  }

  return value.length;
}

export function loose(value: string | null) {
  if (value == null) {
    return;
  }

  return value.length;
}

export function twoStatements(value: string | undefined) {
  if (value === undefined) {
    return;
  }

  console.log(value);

  return value.length;
}

export function notReturn(value: string | undefined) {
  if (value === undefined) {
    return;
  }

  value.length;
}
