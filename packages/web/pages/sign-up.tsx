import React from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "~/auth/firebase-config";
import { useRouter } from "next/router";
import Link from "next/link";

export default function SignUpForm() {
  const router = useRouter();

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const pw = form.get("password");

    if (!email || !pw) {
      return;
    }

    try {
      await createUserWithEmailAndPassword(
        auth,
        email.toString(),
        pw.toString()
      );
      router.push("/");
    } catch (error) {
      console.error("Error signing up", error);
    }
  }

  return (
    <article>
      <header>Sign up to be able to create Vinted watchers</header>
      <form onSubmit={handleSignUp}>
        <label>
          Email
          <input type="email" required />
        </label>
        <label>
          Password
          <input type="password" required />
        </label>
        <button type="submit">Sign Up</button>
      </form>
      <footer>
        Already have an account? <Link href="sign-in">Log in!</Link>
      </footer>
    </article>
  );
}
