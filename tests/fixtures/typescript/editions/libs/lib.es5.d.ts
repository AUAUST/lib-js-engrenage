interface Array<T> {
  length: number;
}

declare var Array: ArrayConstructor;

interface ArrayConstructor {
  isArray(value: unknown): boolean;
}
