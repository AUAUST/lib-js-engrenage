import { isArray } from "@auaust/toolkit/isArray";

import {
  githubApiUrl,
  githubApiVersion,
} from "#tools/github/issues/api/constants";

function findNextUrl(link: string | null) {
  return /<([^>]+)>;\s*rel="next"/.exec(link ?? "")?.[1];
}

export async function requestGithub(
  token: string,
  path: string,
  { missing = "fail" }: { missing?: "fail" | "undefined" } = {},
): Promise<unknown> {
  const pages: unknown[] = [];

  let url: string | undefined = `${githubApiUrl}${path}`;

  while (url !== undefined) {
    const response: Response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": githubApiVersion,
      },
    });

    if (response.status === 404 && missing === "undefined") {
      return;
    }

    if (!response.ok) {
      throw new Error(`GitHub request ${url} failed with ${response.status}`);
    }

    pages.push(await response.json());

    url = findNextUrl(response.headers.get("link"));
  }

  return pages.length === 1 && !isArray(pages[0]) ? pages[0] : pages.flat();
}
