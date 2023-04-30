import Link from "next/link";

export default function Home() {
  return (
    <>
      <header>
        <hgroup>
          <h1>Squirreled</h1>
          <h2>A watcher app for Vinted search results</h2>
          <h3>Get notified by e-mail when new products match your search !</h3>
        </hgroup>
      </header>
      <section>
        <Link href="sign-in" role="button" className="primary">
          Start
        </Link>
      </section>
    </>
  );
}
