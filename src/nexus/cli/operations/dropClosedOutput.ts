import { get } from "@auaust/toolkit/object";

const guarded = new WeakSet<NodeJS.WritableStream>();

function rethrowUnlessClosed(error: unknown): void {
  if (get(error, "code") !== "EPIPE") {
    throw error;
  }
}

/**
 * Drops what the run writes to a stream once its reader closes, so a closed pipe
 * neither crashes the run nor changes its exit code.
 */
export function dropClosedOutput(stream: NodeJS.WritableStream): void {
  if (guarded.has(stream)) {
    return;
  }

  guarded.add(stream);

  stream.on("error", rethrowUnlessClosed);
}
