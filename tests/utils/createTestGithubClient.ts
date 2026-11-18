import { vi } from "vitest";

import {
  createGithubClient,
  type GithubClient,
} from "#tools/github/issues/api/index";

export async function createTestGithubClient(): Promise<GithubClient> {
  vi.stubEnv("GH_TOKEN", "t");

  try {
    return await createGithubClient();
  } finally {
    vi.unstubAllEnvs();
  }
}
