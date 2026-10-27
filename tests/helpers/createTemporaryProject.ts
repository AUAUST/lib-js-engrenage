import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { onTestFinished } from "vitest";

import { entries } from "@auaust/toolkit/object";

export function createTemporaryProject(files: Record<string, string> = {}) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "engrenage-")));

  onTestFinished(() => {
    rmSync(root, {
      recursive: true,
      force: true,
    });
  });

  function resolve(path: string): string {
    return join(root, path);
  }

  function write(path: string, content: string) {
    mkdirSync(dirname(resolve(path)), {
      recursive: true,
    });

    writeFileSync(resolve(path), content);
  }

  function read(path: string): string {
    return readFileSync(resolve(path), "utf8");
  }

  for (const [path, content] of entries(files)) {
    write(path, content);
  }

  return {
    root,
    resolve,
    write,
    read,
  };
}
