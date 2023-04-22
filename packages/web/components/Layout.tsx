import Head from "next/head";
import Link from "next/link";
import React, { ElementType } from "react";
import { useUserData } from "~/auth/auth-provider";
import { signOut } from "firebase/auth";
import { auth } from "~/auth/firebase-config";
import { useRouter } from "next/router";

export default function Layout(props: React.ComponentProps<ElementType>) {
  const { currentUser, isLoading } = useUserData();
  const router = useRouter();

  async function handleLogout(): Promise<void> {
    await signOut(auth);

    router.push("/");
  }

  return (
    <>
      <Head>
        <title>VintBot</title>
        <meta name="description" content="Vinted searches watcher bot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav>
        VintBot
        <ul>
          <li>
            {isLoading && <>Loading...</>}
            {currentUser && (
              <>
                Logged in as {currentUser.email}{" "}
                <button onClick={handleLogout}>Log out</button>
              </>
            )}
            {currentUser === null && <Link href="login">Log In</Link>}
          </li>
        </ul>
      </nav>
      <main>{props.children}</main>
    </>
  );
}
