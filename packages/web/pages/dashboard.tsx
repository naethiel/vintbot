import { useRouter } from "next/router";
import { useEffect } from "react";
import { useUserData } from "~/auth/auth-provider";

export default function Dashboard() {
  const { currentUser, isLoading } = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("login");
    }
  }, [router, currentUser, isLoading]);

  if (!currentUser || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      Logged in successfully: {JSON.stringify(currentUser.toJSON(), null, 2)}
    </div>
  );
}
