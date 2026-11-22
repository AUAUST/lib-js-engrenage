import { readdir } from "node:fs/promises";

import { object, string } from "valibot";

import {
  isMissingError,
  readTextFile,
  resolveWithin,
} from "#foundation/filesystem/index";
import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { parseAgentRunFile } from "#metalbrain/runtimes/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const markerSchema = object({
  role: string(),
  transcript: string(),
});

async function listMarkers(
  directory: Directory,
): Promise<readonly { file: string; agent: string }[]> {
  let files: readonly string[];

  try {
    files = await readdir(directory);
  } catch (error) {
    if (isMissingError(error)) {
      return [];
    }

    throw error;
  }

  return files
    .map((file) => {
      return { file, agent: parseAgentRunFile(file, "running") };
    })
    .filter((marker): marker is { file: string; agent: string } => {
      return marker.agent !== undefined;
    });
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
    files.map(async ({ file, agent }) => {
      const marker = await readMarker(resolveWithin(directory, file));

      return marker === undefined ? undefined : { agent, ...marker };
    }),
  );

  return markers.filter((marker) => marker !== undefined);
}
