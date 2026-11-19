import { text } from "node:stream/consumers";

import { looseObject, optional, parse, string } from "valibot";

// @debt repeats the Claude router's payload schema and stdin read, which each router keeps to import nothing but node: modules and valibot
const payloadSchema = looseObject({
  tool_name: string(),
  tool_input: looseObject({
    command: optional(string()),
  }),
});

export default async function (): Promise<void> {
  const payload = parse(payloadSchema, JSON.parse(await text(process.stdin)));

  if (payload.tool_name === "spawn_agent" || payload.tool_name === "Agent") {
    const {
      default: dispatch,
    } = await import("#bin/engrenage-hook/codex/actions/dispatch");

    await dispatch(payload);

    return;
  }

  const command = payload.tool_input.command ?? "";

  if (
    payload.tool_name !== "Bash" ||
    !/\bgh\b/.test(command) ||
    !/\bissue\b/.test(command)
  ) {
    return;
  }

  const {
    default: github,
  } = await import("#bin/engrenage-hook/actions/github");

  await github(payload, "Codex");
}
