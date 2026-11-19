export default async function (): Promise<void> {
  const {
    default: record,
  } = await import("#bin/engrenage-hook/claude/actions/record");

  await record();
}
