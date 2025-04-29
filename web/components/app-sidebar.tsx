// components/app-sidebar.tsx
import {
  Home,
  MessageSquare,
  Clock,
  Settings,
  Soup,
  LogOut,
  UserRound,
  CalendarFold,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { getProfile } from "@/utils/supabase/queries/profile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function AppSidebar() {
  const queryClient = useQueryClient();
  const supabase = createSupabaseComponentClient();
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["user_profile"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      if (!data) return null;
      return await getProfile(supabase, data.user!.id);
    },
  });

  const items = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Conversations",
      url: "/conversations",
      icon: MessageSquare,
    },
    {
      title: "Transactions",
      url: "/user-posts",
      icon: Clock,
    },
    {
      title: "My Availability",
      url: data ? `/availability/${data.id}` : "/",
      icon: CalendarFold,
    },
    {
      title: "Settings",
      url: data ? `/settings/${data.id}` : "/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar className="border-r-0 max-w-[260px]">
      <SidebarContent className="pt-4">
        <div className="px-4 py-2 mb-4">
          <div className="flex flex-row gap-2">
            <Soup className="text-primary1 w-6 h-6" />
            <h1 className="font-semibold text-xl text-primary1">SwipeShare</h1>
          </div>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-gray-100">
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t py-3 px-4">
        <div className="flex items-center gap-2">
          {data && (
            <div className="flex items-center gap-3">
              {/* Dark mode / light mode toggle. */}
              {/* Dropdown menu for the user, if it exists. */}
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                  <Avatar className="mt-1">
                    <AvatarImage src={data.avatar_url || undefined} />
                    <AvatarFallback className="w-8 h-8 rounded-full bg-secondary1 flex items-center justify-center text-white">
                      <UserRound />
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => router.push(`/settings/${data.id}`)}
                    className="cursor-pointer"
                  >
                    <UserRound /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await supabase.auth.signOut();
                      // Upon signing out, we need to hard-refresh the `user_profile`
                      // query so that the header profile photo updates to indicate
                      // that there is no longer a valid user. We can select this
                      // specific query to refresh in the React Query client by
                      // supplying the query key.
                      queryClient.resetQueries({ queryKey: ["user_profile"] });
                      router.push("/");
                    }}
                    className="cursor-pointer"
                  >
                    <LogOut /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="text-sm text-gray-700">
            {data ? data.handle : "swipey"}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
