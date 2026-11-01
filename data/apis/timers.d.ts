interface TimeoutHandle {
  readonly __timeoutHandle: never;
}

declare function setTimeout<Args extends readonly unknown[]>(
  handler: (...args: Args) => void,
  timeout?: number,
  ...args: Args
): TimeoutHandle;

declare function clearTimeout(handle: TimeoutHandle | undefined): void;
