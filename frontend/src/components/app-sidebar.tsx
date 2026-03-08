"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Bot, Library, MessageSquarePlus, Search, Settings, Share, User } from "lucide-react"

// Menu items.
const items = [
    {
        title: "New task",
        url: "/campaigns/new",
        icon: MessageSquarePlus,
    },
    {
        title: "Agents",
        url: "/agents",
        icon: Bot,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Library",
        url: "/saved-reports",
        icon: Library,
    },
]

export function AppSidebar() {
    return (
        <Sidebar variant="floating">
            <SidebarHeader className="flex flex-row items-center gap-2 p-4">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Bot className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">OpenExpertManus</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton tooltip={item.title}>
                                        <a href={item.url} className="flex items-center gap-2 w-full">
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Projects</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <a href="#" className="flex items-center gap-2 w-full">
                                        <MessageSquarePlus />
                                        <span>New project</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>All tasks</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={true}>
                                    <a href="#" className="flex items-center gap-2 w-full">
                                        <div className="size-2 rounded-full bg-blue-500 mr-2" />
                                        <span className="truncate">Comment améliorer le SEO et mark...</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="mb-2 bg-muted/50 h-auto py-2">
                            <a href="#" className="flex items-center gap-3 w-full">
                                <Share className="size-5 shrink-0" />
                                <div className="flex flex-col items-start text-xs">
                                    <span className="font-medium">Share Manus with a friend</span>
                                    <span className="text-muted-foreground">Get 500 credits each</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <a href="#" className="flex justify-between w-full h-full items-center">
                                <div className="flex items-center gap-2">
                                    <Settings className="size-4" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="size-4" />
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
