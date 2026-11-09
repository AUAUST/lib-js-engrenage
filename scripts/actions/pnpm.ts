import { project } from "#constants";
import { parseVersion, readSharedPnpmRange } from "#project/package/index";
import { resolveLatestPnpm } from "#tools/pnpm/index";

export default async function ({ check }: { check: boolean }): Promise<void> {
  const { floor, range } = readSharedPnpmRange();

  const newest = await resolveLatestPnpm(process.cwd(), "latest");

  const current = parseVersion(floor);
  const latest = parseVersion(newest);

  if (current === undefined || latest === undefined) {
    throw new Error(
      `Cannot compare pnpm ${floor} with ${newest}: one has no version`,
    );
  }

  const message = `${project}'s pnpm ${range} is behind the newest pnpm ${newest}`;

  if (latest.major - current.major >= 2) {
    console.error(message);

    if (check) {
      process.exitCode = 1;
    }
  } else if (latest.major > current.major || latest.minor > current.minor) {
    console.warn(message);
  } else if (latest.patch > current.patch) {
    console.info(message);
  } else {
    console.info(`${project}'s pnpm ${range} is current (${newest})`);
  }
}
