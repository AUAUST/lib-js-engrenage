import { RequestError } from "@octokit/request-error";

export function isMissingResource(error: unknown): boolean {
  return error instanceof RequestError && error.status === 404;
}
