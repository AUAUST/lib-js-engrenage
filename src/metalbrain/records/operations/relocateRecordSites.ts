import { isMap, isScalar, isSeq } from "yaml";

import { isString } from "@auaust/toolkit";

import { readRecordDocument } from "#metalbrain/records/operations/readRecordDocument";
import { readRecordGroups } from "#metalbrain/records/operations/readRecordGroups";
import { writeRecordDocument } from "#metalbrain/records/operations/writeRecordDocument";
import { writeRecordIndex } from "#metalbrain/records/operations/writeRecordIndex";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";
import type { RecordSiteRelocation } from "#metalbrain/records/types/RecordSiteRelocation";

function normalizePath(path: string): string {
  return path.replace(/^(?:\.\/)+/u, "").replace(/\/+$/u, "");
}

function relocateSite(site: string, from: string, to: string) {
  const separator = site.indexOf(":");

  const path = separator === -1 ? site : site.slice(0, separator);

  if (path !== from && !path.startsWith(`${from}/`)) {
    return;
  }

  return `${to}${site.slice(from.length)}`;
}

/**
 * Stages every site of a `kind` entry naming the path `from`, or a path under
 * the directory `from`, rewritten to name the same path under `to`, its line
 * kept, its other fields as written, then regenerates the kind's index.
 *
 * @returns Each rewritten site, with its entry's ID, in group then entry order.
 * @throws {Error} When no site names `from`, or a rewritten entry would break
 * the kind's schema, such as a site naming no file, staging nothing.
 */
export async function relocateRecordSites(
  filesystem: Filesystem,
  kind: RecordKind,
  { from, to }: { from: string; to: string },
  { wordCap }: { wordCap: number },
): Promise<RecordSiteRelocation[]> {
  const source = normalizePath(from);

  const target = normalizePath(to);

  const keys = Object.keys(kind.fields).filter((key) => {
    return kind.fields[key]?.type === "sites";
  });

  const relocations: RecordSiteRelocation[] = [];

  for (const { name } of await readRecordGroups(filesystem, kind)) {
    const record = await readRecordDocument(filesystem, kind, name);

    const changed = new Set<string>();

    for (const node of record.entries.items) {
      const id: unknown = isMap(node) ? node.get("id") : undefined;

      if (!isMap(node) || !isString(id)) {
        continue;
      }

      for (const key of keys) {
        const sites = node.get(key, true);

        for (const item of isSeq(sites) ? sites.items : []) {
          if (!isScalar(item) || !isString(item.value)) {
            continue;
          }

          const relocated = relocateSite(item.value, source, target);

          if (relocated === undefined) {
            continue;
          }

          relocations.push({
            id,
            site: item.value,
            relocated,
          });

          item.value = relocated;

          changed.add(id);
        }
      }
    }

    for (const id of changed) {
      await writeRecordDocument(filesystem, kind, record, { id, wordCap });
    }
  }

  if (relocations.length === 0) {
    throw new Error(
      `No ${kind.name} site names \`${source}\` or a path under it`,
    );
  }

  await writeRecordIndex(filesystem, kind);

  return relocations;
}
