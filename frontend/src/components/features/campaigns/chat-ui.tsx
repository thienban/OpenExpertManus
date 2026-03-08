"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ArrowUp, ChevronDown, Globe, MoreHorizontal, Paperclip, Puzzle } from "lucide-react"
import { useState } from "react"

const agents = [
    { id: "marketing", name: "Agent Marketing", description: "SEO, LinkedIn, Strategy" },
    { id: "data_analysis", name: "Agent Data", description: "Charts, CSV, Analytics" },
    { id: "manus", name: "Manus", description: "General Purpose Assistant" },
]

export function ChatAgentHeader() {
    const [selectedAgent, setSelectedAgent] = useState(agents[0])

    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 justify-between">
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-lg font-semibold px-2">
                            {selectedAgent.name} <ChevronDown className="ml-2 size-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                        {agents.map((agent) => (
                            <DropdownMenuItem key={agent.id} onClick={() => setSelectedAgent(agent)}>
                                <div className="flex flex-col">
                                    <span>{agent.name}</span>
                                    <span className="text-xs text-muted-foreground">{agent.description}</span>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="size-4" />
                </Button>
            </div>
        </header>
    )
}

export function ChatInput() {
    return (
        <div className="relative mx-auto mt-auto flex w-full max-w-3xl flex-col gap-2 p-4">
            <div className="relative flex w-full items-center overflow-hidden rounded-xl border bg-background px-2 pb-2 pt-2 focus-within:ring-1 focus-within:ring-ring">
                <Input
                    placeholder="Message to Marketing Agent..."
                    className="min-h-[44px] w-full resize-none border-0 bg-transparent p-3 shadow-none focus-visible:ring-0"
                />
                <Button
                    type="submit"
                    size="icon"
                    className="absolute right-2 top-3 size-8 rounded-md"
                >
                    <ArrowUp className="size-4" />
                    <span className="sr-only">Send</span>
                </Button>
            </div>

            <div className="flex items-center justify-between px-2">
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground">
                        <Paperclip className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground">
                        <Globe className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground">
                        <Puzzle className="size-4" />
                    </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                    Uses GPT-4o
                </div>
            </div>
        </div>
    )
}
