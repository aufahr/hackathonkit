import ConvexClientProvider from "@/components/ConvexClientProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ReactNode } from "react";

export default function PlaygroundLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ConvexClientProvider>
  );
}
