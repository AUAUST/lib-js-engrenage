import { text } from "node:stream/consumers";

import { looseObject, parse, string } from "valibot";

const payloadSchema = looseObject({
  tool_name: string(),
});

export default async function (): Promise<void> {
  const payload = parse(payloadSchema, JSON.parse(await text(process.stdin)));

  if (payload.tool_name === "Bash") {
    const {
      default: output,
    } = await import("#bin/engrenage-hook/claude/actions/output");

    await output(payload);

    return;
  }

  const {
    default: lint,
  } = await import("#bin/engrenage-hook/claude/actions/lint");

  await lint(payload);
}
