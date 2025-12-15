"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

import { LayoutDashboard, Users, Receipt, Package2, CreditCard, LineChart } from "lucide-react"
import { useSession } from "next-auth/react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const links = [
    { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/admin/users", label: "المستخدمون", icon: Users, adminOnly:true },
    { href: "/admin/subscriptions", label: "الاشتراكات", icon: CreditCard },
    { href: "/admin/plans", label: "الخطط", icon: Package2 },
    { href: "/admin/payments", label: "المدفوعات", icon: Receipt },
    { href: "/admin/stocks", label: "الأسهم", icon: LineChart },
  ]

  const filteredLinks = links.filter(link => {
  if (link.adminOnly) {
    return session?.user?.role  === "ADMIN";
  }
  return true;
});
  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" >
        <SidebarHeader className="pt-4">
          <div className=" px-2 text-lg font-semibold"></div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>القائمة</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredLinks.map((link) => (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton asChild 
                    className="hover:text-white"
                    isActive={pathname === link.href}>
                      <Link href={link.href}
                   
                      >
                        <link.icon
                         className={cn(
                      
                      pathname === link.href && "text-white"
                    )}
                         />
                        <span  className={cn(
                      
                      pathname === link.href && "text-white"
                    )}>{link.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-2 text-xs text-muted-foreground">© {new Date().getFullYear()}</div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-h-svh">
        <header className="flex h-14 items-center gap-2 border-b px-4" dir="rtl">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="font-semibold">Analytics Dashboard</span>
          </div>
          <div className="ms-auto" />
        </header>
        <div className="p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
