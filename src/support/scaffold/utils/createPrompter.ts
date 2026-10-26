import {
  cancel,
  confirm as confirmPrompt,
  isCancel,
  multiselect as multiselectPrompt,
} from "@clack/prompts";

import { freeze } from "@auaust/toolkit/object";

function abort(): never {
  cancel("Cancelled, nothing was written.");

  process.exit(130);
}

export function createPrompter({ yes }: { yes: boolean }) {
  if (!yes && process.stdin.isTTY !== true) {
    throw new Error(
      "engrenage init needs an interactive terminal; pass --yes to accept every step",
    );
  }

  async function confirm(message: string): Promise<boolean> {
    if (yes) {
      return true;
    }

    const answer = await confirmPrompt({
      message,
    });

    if (isCancel(answer)) {
      abort();
    }

    return answer;
  }

  async function multiselect(
    message: string,
    values: ReadonlyArray<string>,
    initial: ReadonlyArray<string> = [],
  ): Promise<string[]> {
    if (yes) {
      return [...initial];
    }

    const options = values.map((value) => {
      return {
        value,
      };
    });

    const answer = await multiselectPrompt({
      message,
      options,
      initialValues: [...initial],
      required: false,
    });

    if (isCancel(answer)) {
      abort();
    }

    return answer;
  }

  return freeze({
    confirm,
    multiselect,
  });
}
