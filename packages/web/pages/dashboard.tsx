import { useRouter } from "next/router";
import { useEffect } from "react";
import { useUserData } from "~/auth/auth-provider";
import { Watchers } from "~/components/watchers";

export default function Dashboard() {
  const { currentUser, isLoading } = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/");
    }
  }, [router, currentUser, isLoading]);

  if (!currentUser || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h1>Logged in successfully</h1>
      <pre>
        <code>{JSON.stringify(currentUser.toJSON(), null, 2)}</code>
      </pre>
      <Watchers />
    </>
  );
}
