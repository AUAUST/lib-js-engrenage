import type { Extension } from "#project/config/types/Extension";

export function explainInactive({ when }: Extension): string | undefined {
  if (when === undefined) {
    return;
  }

  if ("config" in when) {
    return `set ${when.config} to true`;
  }

  const steps = [
    ...(when.preset === undefined ? [] : [`select preset ${when.preset}`]),
    ...("installed" in when ? [`install ${when.installed}`] : []),
  ];

  return steps.join(" and ");
}
