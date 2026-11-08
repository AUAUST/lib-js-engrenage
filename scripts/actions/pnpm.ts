import { project } from "#constants";
import { readSharedPnpmRange } from "#project/package/index";
import { resolveLatestPnpm } from "#tools/pnpm/index";

// @debt splits versions by hand next to compareVersions and parseMajorVersion instead of one version parser that yields major, minor and patch
function toParts(version: string): number[] {
  return version.split(".").map(Number);
}

export default async function ({ check }: { check: boolean }): Promise<void> {
  const { floor, range } = readSharedPnpmRange();

  const newest = await resolveLatestPnpm(process.cwd(), "latest");

  const [major = 0, minor = 0, patch = 0] = toParts(floor);

  const [newestMajor = 0, newestMinor = 0, newestPatch = 0] = toParts(newest);

  const message = `${project}'s pnpm ${range} is behind the newest pnpm ${newest}`;

  if (newestMajor - major >= 2) {
    console.error(message);

    if (check) {
      process.exitCode = 1;
    }
  } else if (newestMajor > major || newestMinor > minor) {
    console.warn(message);
  } else if (newestPatch > patch) {
    console.info(message);
  } else {
    console.info(`${project}'s pnpm ${range} is current (${newest})`);
  }
}
