export async function fetcher<T = any>(
  path: string,
  method: string,
  payload: unknown
): Promise<T> {
  const init: RequestInit = {
    method: method ?? "GET",
  };

  if (payload && method !== "GET") {
    init.body = JSON.stringify(payload);
  }
  return fetch(
    `${process.env.NEXT_PUBLIC_VINTBOT_API_BASE_URL}/${path}`,
    init
  ).then((res) => res.json());
}
