export function attempt(run: () => void): void {
  try {
    run();
  } catch {
    return undefined;
  }
}

export async function load(read: () => Promise<string>) {
  try {
    return await (read() as unknown as string);
  } catch {
    return "";
  }
}
