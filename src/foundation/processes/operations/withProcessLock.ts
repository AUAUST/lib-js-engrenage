import { randomUUID } from "node:crypto";
import { readFileSync, rmSync } from "node:fs";
import { link, mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { setTimeout } from "node:timers/promises";

import { number, object, safeParse, string } from "valibot";

import { get } from "@auaust/toolkit/object";

import { isMissingError, readTextFile } from "#foundation/filesystem/index";
import { LockTimeoutError } from "#foundation/processes/errors/LockTimeoutError";
import type { LockHolder } from "#foundation/processes/types/LockHolder";
import type { File } from "#types/File";

const pollInterval = 500;

const releaseSignals = ["SIGINT", "SIGTERM", "SIGHUP"] as const;

const holderSchema = object({
  pid: number(),
  token: string(),
  label: string(),
  started: string(),
});

function hasCode(error: unknown, code: string): boolean {
  return error instanceof Error && get(error, "code") === code;
}

function parseHolder(content: string): LockHolder | undefined {
  let value: unknown;

  try {
    value = JSON.parse(content);
  } catch {
    return;
  }

  const result = safeParse(holderSchema, value);

  return result.success ? result.output : undefined;
}

function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);

    return true;
  } catch (error) {
    if (hasCode(error, "ESRCH")) {
      return false;
    }

    if (hasCode(error, "EPERM")) {
      return true;
    }

    throw error;
  }
}

async function tryCreate(file: File, holder: LockHolder): Promise<boolean> {
  const temporary = `${file}.${holder.token}`;

  await writeFile(temporary, JSON.stringify(holder));

  try {
    await link(temporary, file);

    return true;
  } catch (error) {
    if (hasCode(error, "EEXIST")) {
      return false;
    }

    throw error;
  } finally {
    await rm(temporary, { force: true });
  }
}

// @debt a waiter that moves away a holder acquired after its read and finds the lock taken again when linking it back leaves two holders running
async function breakStale(
  file: File,
  stale: string,
  token: string,
): Promise<void> {
  const moved = `${file}.${token}.stale`;

  try {
    await rename(file, moved);
  } catch (error) {
    if (isMissingError(error)) {
      return;
    }

    throw error;
  }

  try {
    if ((await readTextFile(moved)) === stale) {
      return;
    }

    await link(moved, file);
  } catch (error) {
    if (!hasCode(error, "EEXIST")) {
      throw error;
    }
  } finally {
    await rm(moved, { force: true });
  }
}

// @debt a stale holder whose pid a live process reuses blocks waiters until the timeout
async function acquire(
  file: File,
  holder: LockHolder,
  { timeout, onWait }: { timeout: number; onWait(holder: LockHolder): void },
): Promise<void> {
  await mkdir(dirname(file), { recursive: true });

  const deadline = Date.now() + timeout;

  let waiting = false;

  for (;;) {
    if (await tryCreate(file, holder)) {
      return;
    }

    const content = await readTextFile(file);

    if (content === undefined) {
      continue;
    }

    const current = parseHolder(content);

    if (current === undefined || !isAlive(current.pid)) {
      await breakStale(file, content, holder.token);

      continue;
    }

    if (!waiting) {
      waiting = true;

      onWait(current);
    }

    if (Date.now() >= deadline) {
      throw new LockTimeoutError(file, current);
    }

    await setTimeout(pollInterval);
  }
}

function release(file: File, token: string): void {
  let content: string;

  try {
    content = readFileSync(file, "utf-8");
  } catch (error) {
    if (isMissingError(error)) {
      return;
    }

    throw error;
  }

  if (parseHolder(content)?.token === token) {
    rmSync(file, { force: true });
  }
}

// @debt a signal arriving after the lock file exists but before the release listeners are registered leaves the lock behind
export async function withProcessLock<T>(
  file: File,
  {
    label,
    timeout,
    onWait,
  }: { label: string; timeout: number; onWait(holder: LockHolder): void },
  run: () => Promise<T>,
): Promise<T> {
  const holder: LockHolder = {
    pid: process.pid,
    token: randomUUID(),
    label,
    started: new Date().toISOString(),
  };

  await acquire(file, holder, { timeout, onWait });

  function settle() {
    process.off("exit", settle);

    for (const signal of releaseSignals) {
      process.off(signal, raise);
    }

    release(file, holder.token);
  }

  function raise(signal: NodeJS.Signals) {
    settle();

    process.kill(process.pid, signal);
  }

  process.once("exit", settle);

  for (const signal of releaseSignals) {
    process.once(signal, raise);
  }

  try {
    return await run();
  } finally {
    settle();
  }
}
