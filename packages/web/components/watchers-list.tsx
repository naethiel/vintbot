import useSWR from "swr";
import { GetWatchersResponse } from "~/../types/types";
import { fetcher } from "~/fetcher";

export function Watchers() {
  const watchers = useSWR<GetWatchersResponse>(
    "watchers",
    fetcher<GetWatchersResponse>
  );

  if (!watchers.data) {
    return (
      <tr>
        <td>loading...</td>
      </tr>
    );
  }
  return (
    <>
      {watchers.data.data.watchers.map((w) => {
        const date = w.crawled_at
          ? Date.parse(w.crawled_at).toLocaleString()
          : "Not yet";
        return (
          <tr key={w.id}>
            <td>{w.id}</td>
            <td>{w.query}</td>
            <td>{w.email}</td>
            <td>{date}</td>
          </tr>
        );
      })}
    </>
  );
}
