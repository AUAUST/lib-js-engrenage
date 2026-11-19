export default async function (source: "skill" | undefined): Promise<void> {
  const { default: run } = await (source === "skill"
    ? import("#bin/engrenage-hook/claude/actions/gate")
    : import("#bin/engrenage-hook/claude/actions/record"));

  await run();
}
