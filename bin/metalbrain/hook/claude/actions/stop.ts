import hostCheck from "#bin/metalbrain/hook/claude/actions/hostCheck";

export default function (check?: "gateStop"): Promise<void> {
  return hostCheck(check ?? "recordRun", "Stop");
}
