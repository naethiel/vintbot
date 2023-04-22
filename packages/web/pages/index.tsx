import Link from "next/link";

export default function Home() {
  return (
    <>
      <header>
        <h1>VintBot</h1>
        <h2>A watcher app for vinted search results</h2>
      </header>
      <section>
        <h3>Get notified by e-mail when new products match your search !</h3>
        <Link href="/login">
          <button>Start</button>
        </Link>
      </section>
    </>
  );
}
