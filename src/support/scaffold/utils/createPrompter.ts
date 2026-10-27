import {
  cancel,
  confirm as confirmPrompt,
  isCancel,
  select as selectPrompt,
  text as textPrompt,
} from "@clack/prompts";

import { freeze } from "@auaust/toolkit/object";

function abort(): never {
  cancel("Cancelled, nothing was written.");

  process.exit(130);
}

function requireValue(value: string | undefined): string | undefined {
  return value === undefined || value.trim() === ""
    ? "Enter a value"
    : undefined;
}

export function createPrompter({ yes }: { yes: boolean }) {
  if (!yes && !process.stdin.isTTY) {
    throw new Error(
      "engrenage init needs an interactive terminal; pass --yes to accept every step",
    );
  }

  async function confirm(message: string, initial = true): Promise<boolean> {
    if (yes) {
      return initial;
    }

    const answer = await confirmPrompt({
      message,
      initialValue: initial,
    });

    if (isCancel(answer)) {
      abort();
    }

    return answer;
  }

  async function select<Value extends string>(
    message: string,
    values: ReadonlyArray<Value>,
    initial: Value,
  ): Promise<Value> {
    if (yes) {
      return initial;
    }

    const options = values.map((value): { value: string } => {
      return {
        value,
      };
    });

    const answer = await selectPrompt({
      message,
      options,
      initialValue: initial,
    });

    if (isCancel(answer)) {
      abort();
    }

    const chosen = values.find((value) => value === answer);

    if (chosen === undefined) {
      throw new Error(`${answer} is not one of the offered choices`);
    }

    return chosen;
  }

  async function text(message: string, initial: string): Promise<string> {
    if (yes) {
      return initial;
    }

    const answer = await textPrompt({
      message,
      initialValue: initial,
      validate: requireValue,
    });

    if (isCancel(answer)) {
      abort();
    }

    return answer.trim();
  }

  return freeze({
    confirm,
    select,
    text,
  });
}
