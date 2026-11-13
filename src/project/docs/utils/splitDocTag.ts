import type { TagDeclaration } from "#project/docs/types/TagDeclaration";

type SplitDocTag =
  | {
      readonly ok: true;
      readonly type?: string;
      readonly subject?: string;
      readonly body: string;
    }
  | { readonly ok: false; readonly message: string };

function findTypeEnd(text: string): number | undefined {
  let depth = 0;

  for (const { 0: brace, index } of text.matchAll(/[{}]/g)) {
    if (brace === "{") {
      depth++;
    } else {
      depth--;

      if (depth === 0) {
        return index;
      }
    }
  }
}

function reject(message: string): SplitDocTag {
  return { ok: false, message };
}

export function splitDocTag(
  declaration: TagDeclaration,
  text: string,
): SplitDocTag {
  const tag = `@${declaration.name}`;

  let rest = text.trim();
  let type: string | undefined;
  let subject: string | undefined;

  if (rest.startsWith("{")) {
    if (declaration.type === undefined) {
      return reject(`${tag} takes no type in braces.`);
    }

    const end = findTypeEnd(rest);

    if (end === undefined) {
      return reject(`${tag} has an unclosed type brace.`);
    }

    type = rest.slice(1, end).trim();
    rest = rest.slice(end + 1).trimStart();
  } else if (declaration.type === "required") {
    return reject(`${tag} requires a type in braces.`);
  }

  if (declaration.subject !== undefined) {
    const [word] = rest.split(/\s/, 1);

    if (word === undefined || word === "" || word === "-") {
      return reject(`${tag} requires a ${declaration.subject} name.`);
    }

    subject = word;

    rest = rest
      .slice(word.length)
      .trimStart()
      .replace(/^-(?:\s+|$)/, "");
  }

  if (declaration.body === "none" && rest !== "") {
    return reject(`${tag} takes no text.`);
  }

  if (declaration.body === "inline" && rest.includes("\n")) {
    return reject(`${tag} takes one line of text.`);
  }

  return {
    ok: true,
    ...(type === undefined ? {} : { type }),
    ...(subject === undefined ? {} : { subject }),
    body: rest,
  };
}
