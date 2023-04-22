import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "~/auth/firebase-config";
import Link from "next/link";

export default function Login() {
  const router = useRouter();

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const form = new FormData(e.currentTarget);
          let email = form.get("email");
          let pw = form.get("password");

          if (!pw || !email) {
            return;
          }

          try {
            await signInWithEmailAndPassword(
              auth,
              email.toString(),
              pw.toString()
            );
            router.push("/dashboard");
          } catch (error) {
            console.error("Error signing in", error);
          }
        }}
      >
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
      <p>
        Don't have an account yet? <Link href="./sign-up">Sign up!</Link>
      </p>
    </div>
  );
}
