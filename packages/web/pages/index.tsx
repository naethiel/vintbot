import Head from "next/head";
import styles from "~/styles/Home.module.css";
import { Watchers } from "~/components/watchers-list";

export default function Home() {
  return (
    <>
      <Head>
        <title>VintBot</title>
        <meta name="description" content="Vinted searches watcher bot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <header>
          <h1>VintBot</h1>
          <h2>Watcher for vinted search results</h2>
        </header>
        <section>
          Currently watched URLs
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Path</th>
                <th>Address</th>
                <th>Last crawled</th>
              </tr>
            </thead>
            <tbody>
              <Watchers />
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
