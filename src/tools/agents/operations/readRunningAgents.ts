import { readdir } from "node:fs/promises";

import { object, string } from "valibot";

import {
  isMissingError,
  readTextFile,
  resolveWithin,
} from "#foundation/filesystem/index";
import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const runningSuffix = ".running";

const markerSchema = object({
  role: string(),
  transcript: string(),
});

async function listMarkers(directory: Directory): Promise<readonly string[]> {
  let files: readonly string[];

  try {
    files = await readdir(directory);
  } catch (error) {
    if (isMissingError(error)) {
      return [];
    }

    throw error;
  }

  return files.filter((file) => file.endsWith(runningSuffix));
}

function parseMarker(
  content: string,
  path: File,
): { role: string; transcript?: File } {
  // @debt a legacy marker holds the bare role, told apart from JSON by its first character; drop this branch once no stats directory keeps one
  return content.startsWith("{")
    ? validate(markerSchema, parseJson(content, path), path)
    : { role: content };
}

async function readMarker(
  path: File,
): Promise<{ role: string; transcript?: File } | undefined> {
  const content = await readTextFile(path);

  return content === undefined ? undefined : parseMarker(content.trim(), path);
}

export async function readRunningAgents(
  directory: Directory,
): Promise<readonly { agent: string; role: string; transcript?: File }[]> {
  const files = await listMarkers(directory);

  const markers = await Promise.all(
    files.map(async (file) => {
      const marker = await readMarker(resolveWithin(directory, file));

      return marker === undefined
        ? undefined
        : { agent: file.slice(0, -runningSuffix.length), ...marker };
    }),
  );

  return markers.filter((marker) => marker !== undefined);
}
