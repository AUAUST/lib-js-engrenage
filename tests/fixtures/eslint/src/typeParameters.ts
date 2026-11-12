export function cast<Value = any>(target: {}): Value | null;
export function cast<Value = any>(target: unknown): Value | null | undefined;
export function cast(target: unknown) {
  return target ?? null;
}

export function discard<Value = any>(target: {}): null {
  return target === null ? target : null;
}

export function consume<Value>(target: Value): void {
  void target;
}

function hold<Value>(value: Value): {
  readonly value: NoInfer<Value>;
} {
  return { value };
}

export function wrap<Value>(read: () => Value) {
  return hold(read());
}
