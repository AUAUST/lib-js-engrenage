export function blockStop(reason: string) {
  process.stdout.write(`${JSON.stringify({ decision: "block", reason })}\n`);
}
