import { reportClones } from "#tools/jscpd/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (reference: string): Promise<void> {
  const report = await reportClones(await loadValidatedConfig(), {
    since: reference,
  });

  console.info(report ?? `No new clones since ${reference}.`);
}
