export function respondJson(
  json: unknown,
  headers: Readonly<Record<string, string>> = {},
): Promise<Response> {
  return Promise.resolve(
    new Response(JSON.stringify(json), {
      status: 200,
      headers: { "content-type": "application/json", ...headers },
    }),
  );
}
