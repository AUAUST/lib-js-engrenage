import { getCompatibleVersions } from "baseline-browser-mapping";
import nodeReleases from "node-releases/data/processed/envs.json" with { type: "json" };

import { freeze } from "@auaust/toolkit/object";

import { assertBaselineSnapshot } from "#project/baseline/utils/assertBaselineSnapshot";

// @debt assumes V8 versions follow Chromium majors (Chromium 138 ships V8 13.8); holds only while Google keeps that numbering
function toV8Version(chrome: number): [number, number] {
  const digits = String(chrome);

  return [Number(digits.slice(0, -1)), Number(digits.slice(-1))];
}

function reachesV8(v8: string, [major, minor]: [number, number]): boolean {
  const [nodeMajor = 0, nodeMinor = 0] = v8.split(".").map(Number);

  return nodeMajor > major || (nodeMajor === major && nodeMinor >= minor);
}

function findNodeMajor(chrome: number): number {
  const target = toV8Version(chrome);
  const seen = new Set<number>();

  // @debt returns the first match, so it relies on node-releases listing releases in ascending version order
  for (const release of nodeReleases) {
    const major = Number.parseInt(release.version, 10);

    if (release.name !== "nodejs" || seen.has(major)) {
      continue;
    }

    seen.add(major);

    if (reachesV8(release.v8, target)) {
      return major;
    }
  }

  throw new Error(`No Node.js release reaches Chromium ${chrome}`);
}

export function resolveBaselineMinimums(snapshot: string) {
  assertBaselineSnapshot(snapshot);

  const browsers: Record<string, string> = {};

  for (const { browser, version } of getCompatibleVersions({
    widelyAvailableOnDate: `${snapshot}-01`,
    suppressWarnings: true,
  })) {
    browsers[browser] = version;
  }

  const { chrome } = browsers;

  if (chrome === undefined) {
    throw new Error(`No Chrome version is widely available in ${snapshot}`);
  }

  return freeze({
    browsers: freeze(browsers),
    node: findNodeMajor(Number.parseInt(chrome, 10)),
  });
}
