// components/app-sidebar.tsx
import { Home, MessageSquare, Clock, Settings, Soup } from "lucide-react";
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
import { useProfile } from "@/hooks/use-profile";

// Menu items
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
    title: "Past Transactions",
    url: "/transactions",
    icon: Clock,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) return null;
  console.log(error?.message)
  if (error || !profile) return <div className="p-4">Error loading sidebar</div>;

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
                    <Link href={item.url} className="flex items-center gap-3 text-gray-700">
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
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
            {profile.name?.[0] ?? "?"}
          </div>
          <div className="text-sm text-gray-700">{profile.name}</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
