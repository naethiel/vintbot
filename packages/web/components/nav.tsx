import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUserData } from "~/auth/auth-provider";
import { auth } from "~/auth/firebase-config";

export function Nav() {
  const { currentUser } = useUserData();
  const router = useRouter();

  async function handleLogout(): Promise<void> {
    await signOut(auth);

    router.push("/");
  }

  return (
    <nav className="container-fluid">
      <ul>
        <li>
          <strong>
            <Link className="contrast" href="/">
              Squirreled
            </Link>
          </strong>
        </li>
      </ul>
      <ul>
        <li>
          {currentUser && (
            <>
              <Link
                href="/"
                onClick={handleLogout}
                role="button"
                className="secondary"
              >
                Log out
              </Link>
            </>
          )}
          {currentUser === null && (
            <Link href="sign-in" role="button">
              Log In
            </Link>
          )}
        </li>
        <li>
          <Link href="about" role="button" className="contrast outline">
            About
          </Link>
        </li>
      </ul>
    </nav>
  );
}
