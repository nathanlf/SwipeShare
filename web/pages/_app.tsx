import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useRouter } from "next/router";

const queryClient = new QueryClient();
//use ifexcludedroutes array
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const excludedRoutes = ["/login", "/signup"];

  if (excludedRoutes.includes(router.pathname)) {
    return (
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
        <Toaster />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider className="">
        <div className="flex h-screen w-full overflow-hidden">
          <AppSidebar />
          <main className="flex-1 bg-[#DCDEE5] relative">
            {/* The sidebar trigger will now be positioned by the Sidebar component */}
            <div className="absolute top-4 left-4 z-50 transition-all duration-200">
              <SidebarTrigger className="w-10 h-10 p-2 bg-white/80 backdrop-blur-sm rounded-md shadow-sm" />
            </div>
            <Component {...pageProps} />
          </main>
          <Toaster />
        </div>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
