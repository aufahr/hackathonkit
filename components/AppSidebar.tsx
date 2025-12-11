"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Volume2, MessageSquare, Home, BookOpen, Sparkles, ExternalLink, Box, Rocket, Layers } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apps } from "@/config/apps";

const playgroundItems = [
  {
    title: "Audio Playground",
    url: "/playground/audio",
    icon: Volume2,
    description: "Text-to-speech & voice",
  },
  {
    title: "Chat Playground",
    url: "/playground/chat",
    icon: MessageSquare,
    description: "Real-time messaging",
  },
];

const bottomItems = [
  {
    title: "Documentation",
    url: "https://elevenlabs.io/docs",
    icon: BookOpen,
    external: true,
  },
  {
    title: "Home",
    url: "/",
    icon: Home,
    external: false,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="group/logo">
              <Link href="/">
                <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-foreground text-background transition-all group-hover/logo:scale-105">
                  <Box className="h-5 w-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold tracking-tight">Hackathon Kit</span>
                  <span className="truncate text-xs text-muted-foreground font-medium">Build & Ship</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarSeparator className="mx-3" />
      
      <SidebarContent className="pt-2">
        {/* Playground Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            Playground
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {playgroundItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.title}
                      className={`
                        group/item transition-all duration-200
                        ${isActive 
                          ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-medium shadow-sm" 
                          : "hover:bg-accent/80"
                        }
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <div className={`
                          flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200
                          ${isActive 
                            ? "bg-primary/15 text-primary" 
                            : "bg-muted/50 text-muted-foreground group-hover/item:bg-primary/10 group-hover/item:text-primary"
                          }
                        `}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Apps Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
            <Rocket className="h-3 w-3" />
            Apps
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {apps.map((app) => {
                const appUrl = `/app/${app.slug}`;
                const isActive = pathname === appUrl || pathname.startsWith(`/app/${app.slug}/`);
                return (
                  <SidebarMenuItem key={app.slug}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={app.name}
                      className={`
                        group/item transition-all duration-200
                        ${isActive 
                          ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-medium shadow-sm" 
                          : "hover:bg-accent/80"
                        }
                      `}
                    >
                      <Link href={appUrl} className="flex items-center gap-3">
                        <div className={`
                          flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200
                          ${isActive 
                            ? "bg-primary/15 text-primary" 
                            : "bg-muted/50 text-muted-foreground group-hover/item:bg-primary/10 group-hover/item:text-primary"
                          }
                        `}>
                          <Layers className="h-4 w-4" />
                        </div>
                        <span>{app.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="pb-4">
        <SidebarSeparator className="mx-3 mb-2" />
        <SidebarMenu className="gap-0.5">
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title}
                className="group/footer text-muted-foreground hover:text-foreground transition-colors"
              >
                <Link 
                  href={item.url} 
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-3"
                >
                  <item.icon className="h-4 w-4 transition-transform group-hover/footer:scale-110" />
                  <span className="flex-1">{item.title}</span>
                  {item.external && (
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        {/* Version badge */}
        <div className="mx-3 mt-4 rounded-lg bg-gradient-to-r from-accent/80 to-accent/40 px-3 py-2 text-center group-data-[collapsible=icon]:hidden">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            v1.0.0 • Ready to ship 🚀
          </span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
