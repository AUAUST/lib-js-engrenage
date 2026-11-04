import { parseMajorVersion } from "#project/package/utils/parseMajorVersion";
import { readSharedPnpmRange } from "#project/package/utils/readSharedPnpmRange";

export function readTestPnpmVersions() {
  const { floor } = readSharedPnpmRange();

  const major = parseMajorVersion(floor);

  if (major === undefined) {
    throw new Error(`engrenage's pnpm floor has no major: ${floor}`);
  }

  if (floor === `${major}.0.0`) {
    throw new Error(
      `engrenage's pnpm floor ${floor} leaves no version below it within its major`,
    );
  }

  return {
    floor,
    previousMajor: `${major - 1}.0.0`,
    belowFloor: `${major}.0.0`,
    latest: `${major}.99.0`,
    nextMajor: `${major + 1}.0.0`,
  };
}
