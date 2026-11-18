import { readFile } from "node:fs/promises";

import { isMissingError, resolve } from "#foundation/filesystem/index";
import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { linksSchema } from "#tools/pnpm/config/schemas/linksSchema";
import { linksFile } from "#tools/pnpm/constants";
import type { Links } from "#tools/pnpm/types/Links";
import type { Directory } from "#types/Directory";

/**
 * The checkouts `root` links its dependencies to, by registered short name;
 * empty without a record.
 */
export async function readLinks(root: Directory): Promise<Links> {
  const path = resolve(root, linksFile);

  let content: string;

  try {
    content = await readFile(path, "utf-8");
  } catch (error) {
    if (isMissingError(error)) {
      return {};
    }

    throw error;
  }

  return validate(linksSchema, parseJson(content, path), path);
}
