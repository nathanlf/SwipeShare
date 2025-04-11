import Header from "@/components/header";
import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen flex-col px-4 overflow-scroll">
        <Header />
        <Component {...pageProps} />
      </div>
    </QueryClientProvider>
  );
}
