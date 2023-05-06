import type { AppProps } from "next/app";
import { AuthProvider } from "~/auth/auth-provider";
import Layout from "~/components/Layout";
import "./app.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
