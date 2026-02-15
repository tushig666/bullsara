import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { LayoutDashboard, Ticket, ListOrdered } from "lucide-react";
import { UI } from "@/lib/i18n";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    notFound();
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
                <Link href="/admin"><LayoutDashboard />{UI.ADMIN.DASHBOARD}</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
                <Link href="/admin/lotteries"><Ticket />{UI.ADMIN.LOTTERIES}</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
                <Link href="/admin/orders"><ListOrdered />{UI.ADMIN.ORDERS}</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>
      <SidebarInset>
        <header className="p-4 border-b flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">{UI.GENERAL.ADMIN_PANEL}</h1>
        </header>
        <div className="p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
