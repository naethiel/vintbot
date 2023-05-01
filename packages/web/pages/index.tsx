import Link from "next/link";
import { useUserData } from "~/auth/auth-provider";

export default function Home() {
  const { currentUser } = useUserData();

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
        <Link
          href={currentUser ? "dashboard" : "sign-in"}
          role="button"
          className="primary"
        >
          Start
        </Link>
      </section>
    </>
  );
}
