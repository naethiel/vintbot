import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "~/auth/firebase-config";
import Link from "next/link";
import Image from "next/image";
import squirrel from "~/assets/squirrel01.jpg";
import styles from "./sign-in.module.css";

export default function Signin() {
  const router = useRouter();

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    let email = form.get("email");
    let pw = form.get("password");

    if (!pw || !email) {
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.toString(), pw.toString());
      router.push("/dashboard");
    } catch (error) {
      console.error("Error signing in", error);
    }
  }

  return (
    <div className={`grid ${styles.container}`}>
      <article>
        <header>Log in</header>
        <form onSubmit={handleSignIn}>
          <label>
            E-mail
            <input type="email" name="email" />
          </label>
          <label>
            Password
            <input type="password" name="password" />
          </label>
          <button type="submit">Login</button>
        </form>
        <footer>
          Don't have an account yet? <Link href="./sign-up">Sign up!</Link>
        </footer>
      </article>
      <div className={styles.squirrel}>
        <Image src={squirrel} alt="squirrel illustration" placeholder="blur" />
      </div>
    </div>
  );
}
