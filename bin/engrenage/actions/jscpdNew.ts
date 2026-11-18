import { reportClones } from "#tools/jscpd/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (reference: string): Promise<void> {
  const report = await reportClones(
    await loadValidatedConfig(undefined, {
      reporter: getRunContext().reporter,
    }),
    {
      since: reference,
    },
  );

  getRunContext().reporter.log(report ?? `No new clones since ${reference}.`);
}
