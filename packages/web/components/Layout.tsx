import Head from "next/head";
import React, { ElementType } from "react";
import { Nav } from "./nav";
import styles from "./layout.module.css";

export default function Layout(props: React.ComponentProps<ElementType>) {
  return (
    <>
      <Head>
        <title>Squirreled</title>
        <meta name="description" content="Vinted searches watcher bot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.page}>
        <Nav />
        <main className={`container ${styles.main}`}>{props.children}</main>
        <footer className={`container-fluid ${styles.footer}`}>
          <small>
            Made with ❤️ by{" "}
            <a href="https://www.github.com/naethiel" className="contrast">
              Naethiel
            </a>
          </small>
        </footer>
      </div>
    </>
  );
}
