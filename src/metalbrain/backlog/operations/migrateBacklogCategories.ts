import { posix } from "node:path";

import { stringify } from "yaml";

import { isString } from "@auaust/toolkit";

import { splitSections } from "#foundation/markdown/index";
import {
  backlog,
  backlogDirectory,
  backlogReferenceFiles,
  legacyBacklogExtension,
  legacyBacklogIndex,
} from "#metalbrain/backlog/constants";
import { recordFileExtension } from "#metalbrain/records/constants";
import { createRecordId, listRecordIds } from "#metalbrain/records/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Globs } from "#types/Globs";

type LegacyValue = string | readonly string[];

interface LegacyEntry {
  readonly number: string;
  readonly title: string;
  readonly fields: Map<string, LegacyValue>;
}

interface LegacyField {
  readonly key: string;
  text: string;
  readonly items: string[];
}

const titlePattern = /^(?:(\S+?)\.\s+)?(.*)$/u;
const indexLinkPattern = /^- \[[^\]]*\]\(([\w-]+)\.md\):[ \t]*(\S.*?)[ \t]*$/u;
const bulletPattern = /^- ([\w-]+):[ \t]*(.*)$/u;
const itemPattern = /^\s+(?:[-*]|\d+\.)\s+(.*)$/u;
const sitesPattern = /^`[^`]+`(?:, `[^`]+`)*$/u;
const keyOrder = Object.keys(backlog.fields).filter((key) => key !== "title");

function toValue({ key, text, items }: LegacyField): LegacyValue {
  if (key === "sites" && items.length === 0 && sitesPattern.test(text)) {
    return text.slice(1, -1).split("`, `");
  }

  if (items.length === 0) {
    return text;
  }

  return text === "" ? items : [text, ...items];
}

function addField(entry: LegacyEntry, field: LegacyField) {
  const value = toValue(field);

  const current = entry.fields.get(field.key);

  entry.fields.set(
    field.key,
    current === undefined
      ? value
      : [
          ...(isString(current) ? [current] : current),
          ...(isString(value) ? [value] : value),
        ],
  );
}

function appendLine(field: LegacyField, line: string) {
  const last = field.items.length - 1;

  if (last === -1) {
    field.text = field.text === "" ? line : `${field.text}\n${line}`;
  } else {
    field.items[last] = `${field.items[last]}\n${line}`;
  }
}

function parseLegacyEntry(
  heading: string,
  lines: readonly string[],
): LegacyEntry {
  const [, number = "", title = ""] = titlePattern.exec(heading) ?? [];

  const entry: LegacyEntry = {
    number,
    title,
    fields: new Map(),
  };

  let field: LegacyField | undefined;

  for (const line of lines) {
    if (line.trim() === "") {
      continue;
    }

    const bullet = bulletPattern.exec(line);

    if (bullet !== null) {
      if (field !== undefined) {
        addField(entry, field);
      }

      const [, key = "", text = ""] = bullet;

      field = {
        key: key === "site" ? "sites" : key,
        text,
        items: [],
      };

      continue;
    }

    field ??= {
      key: "text",
      text: "",
      items: [],
    };

    const item = itemPattern.exec(line);

    if (item === null) {
      appendLine(field, line.trim());
    } else {
      field.items.push(item[1] ?? "");
    }
  }

  if (field !== undefined) {
    addField(entry, field);
  }

  return entry;
}

function parseLegacyCategory(content: string) {
  const [preamble, ...sections] = splitSections(content, 2);

  const purpose = (preamble?.source ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      return line !== "" && !line.startsWith("# ");
    })
    .join(" ");

  const entries = sections.map(({ name = "", source }) => {
    return parseLegacyEntry(name, source.split("\n").slice(1));
  });

  return { purpose, entries };
}

async function readIndexPurposes(
  filesystem: Filesystem,
): Promise<Map<string, string>> {
  const content = await filesystem.read(legacyBacklogIndex);

  const purposes = new Map<string, string>();

  for (const line of content?.split("\n") ?? []) {
    const [, name, purpose] = indexLinkPattern.exec(line) ?? [];

    if (name !== undefined && purpose !== undefined) {
      purposes.set(name, purpose);
    }
  }

  return purposes;
}

function orderFields(fields: ReadonlyMap<string, LegacyValue>) {
  const known = keyOrder.filter((key) => fields.has(key));

  const others = [...fields.keys()].filter((key) => !keyOrder.includes(key));

  return [...known, ...others].map((key) => {
    return [key, fields.get(key)] as const;
  });
}

// @debt a `<category>.<n>` reference to an entry renumbered or removed before the migration is rewritten to the entry holding that number today.
// @debt references outside the agent records and instruction files, such as code comments, stay stale
async function rewriteReferences(
  filesystem: Filesystem,
  ids: ReadonlyMap<string, string>,
  instructionFiles: Globs,
) {
  const pattern = /(?<![\w.-])([\w-]+\.\w+)(?![\w-])/gu;

  const files = await filesystem.glob([
    ...backlogReferenceFiles,
    ...instructionFiles,
    `${backlogDirectory}/*${recordFileExtension}`,
  ]);

  for (const file of files) {
    const content = await filesystem.read(file);

    if (content === undefined) {
      continue;
    }

    const rewritten = content.replaceAll(pattern, (reference: string) => {
      return ids.get(reference) ?? reference;
    });

    if (rewritten !== content) {
      await filesystem.write(file, rewritten);
    }
  }
}

/**
 * Converts each legacy `.ai/backlog/<category>.md` into its `.yml` category,
 * giving each entry an ID of `day` and taking the purpose from the index's link
 * when the file states none, then rewrites the `<category>.<n>` references of
 * the agent records and `instructionFiles` to these IDs.
 *
 * @throws {Error} When a legacy category's `.yml` file already exists.
 */
export async function migrateBacklogCategories(
  filesystem: Filesystem,
  day: Date,
  instructionFiles: Globs,
): Promise<void> {
  const legacy = await filesystem.glob(
    `${backlogDirectory}/*${legacyBacklogExtension}`,
  );

  const files = legacy.filter((file) => file !== legacyBacklogIndex);

  if (files.length === 0) {
    return;
  }

  const taken = await listRecordIds(filesystem, backlog);

  const indexPurposes = await readIndexPurposes(filesystem);

  const ids = new Map<string, string>();

  for (const file of files) {
    const name = posix.basename(file, legacyBacklogExtension);

    const target = `${backlogDirectory}/${name}${recordFileExtension}`;

    if (await filesystem.exists(target)) {
      throw new Error(
        `${file} and ${target} both exist: merge the legacy entries into ${target}, then delete ${file}`,
      );
    }

    const content = await filesystem.read(file);

    if (content === undefined) {
      throw new Error(`${file}: listed by the backlog glob but unreadable`);
    }

    const { purpose, entries } = parseLegacyCategory(content);

    const migrated = entries.map(({ number, title, fields }) => {
      const id = createRecordId(taken, day);

      taken.add(id);

      if (number !== "") {
        ids.set(`${name}.${number}`, id);
      }

      return Object.fromEntries([
        ["id", id],
        ["title", title],
        ...orderFields(fields),
      ]);
    });

    await filesystem.write(
      target,
      stringify(
        {
          purpose: purpose === "" ? (indexPurposes.get(name) ?? "") : purpose,
          entries: migrated,
        },
        {
          lineWidth: 0,
        },
      ),
    );

    await filesystem.remove(file);
  }

  await rewriteReferences(filesystem, ids, instructionFiles);
}
