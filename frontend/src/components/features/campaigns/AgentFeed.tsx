"use client"

import { AgentMessage, ProgressPlan, useCampaignStream } from "@/hooks/useCampaignStream"
import { cn } from "@/lib/utils"
import {
    Brain,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Circle,
    FileText,
    Globe,
    Loader2,
    Terminal,
    Wrench,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

// ---- Sub-components ----

function ThoughtBubble({ content }: { content: string }) {
    const [open, setOpen] = useState(false)
    const preview = content.slice(0, 120)
    const isTruncated = content.length > 120

    return (
        <div className="flex items-start gap-2 py-1">
            <Brain className="mt-0.5 size-4 shrink-0 text-purple-400" />
            <div className="text-sm text-muted-foreground italic leading-relaxed">
                <span>{open || !isTruncated ? content : `${preview}…`}</span>
                {isTruncated && (
                    <button
                        onClick={() => setOpen(!open)}
                        className="ml-2 text-xs text-purple-400 hover:underline"
                    >
                        {open ? "show less" : "show more"}
                    </button>
                )}
            </div>
        </div>
    )
}

function ToolCallBubble({ content }: { content: string }) {
    let tools: string[] = []
    try {
        const parsed = JSON.parse(content)
        tools = parsed.tools ?? (parsed.tool ? [parsed.tool] : [])
    } catch {
        tools = [content]
    }

    return (
        <div className="flex items-center gap-2 py-1">
            <Wrench className="size-4 shrink-0 text-blue-400" />
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-mono text-blue-400 border border-blue-500/20">
                {tools.join(", ")}
            </span>
        </div>
    )
}

function ToolArgsBubble({ content }: { content: string }) {
    const [open, setOpen] = useState(false)
    let args: Record<string, unknown> = {}
    try {
        args = JSON.parse(content).args ?? {}
    } catch {
        return null
    }

    const keys = Object.keys(args)
    if (keys.length === 0) return null

    return (
        <div className="ml-6 mt-0.5">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
                {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                {open ? "hide params" : "view params"}
            </button>
            {open && (
                <pre className="mt-1 overflow-x-auto rounded-md bg-muted p-2 text-xs text-foreground font-mono">
                    {JSON.stringify(args, null, 2)}
                </pre>
            )}
        </div>
    )
}

function ToolResultBubble({ content }: { content: string }) {
    const [open, setOpen] = useState(false)
    let resultText = content
    try {
        const parsed = JSON.parse(content)
        resultText = parsed.result ?? content
    } catch {
        // use raw
    }
    // Remove internal log prefix if present
    resultText = resultText.replace(/^Observed output of cmd `[^`]+` executed:\s*/i, "")
    const preview = resultText.slice(0, 200)
    const isTruncated = resultText.length > 200

    return (
        <div className="ml-6 flex flex-col gap-1">
            <div className="text-xs text-muted-foreground">
                <span>{open || !isTruncated ? resultText : `${preview}…`}</span>
                {isTruncated && (
                    <button
                        onClick={() => setOpen(!open)}
                        className="ml-2 text-blue-400 hover:underline"
                    >
                        {open ? "show less" : "show more"}
                    </button>
                )}
            </div>
        </div>
    )
}

function TextBubble({ content }: { content: string }) {
    return (
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
            <FileText className="mt-0.5 size-4 shrink-0 text-green-400" />
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
    )
}

// ---- Plan tracker ----

function PlanTracker({ plan }: { plan: ProgressPlan }) {
    return (
        <div className="rounded-xl border bg-card p-4 mb-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Terminal className="size-4" />
                {plan.title}
            </h3>
            <ol className="space-y-2">
                {plan.steps.map((step, i) => {
                    const isDone = plan.completedSteps.includes(i)
                    const isActive = plan.activeStep === i

                    return (
                        <li key={i} className={cn("flex items-start gap-2 text-sm")}>
                            {isDone ? (
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" />
                            ) : isActive ? (
                                <Loader2 className="mt-0.5 size-4 shrink-0 text-blue-400 animate-spin" />
                            ) : (
                                <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/40" />
                            )}
                            <span
                                className={cn(
                                    "leading-relaxed",
                                    isDone && "line-through text-muted-foreground",
                                    isActive && "text-blue-400 font-medium",
                                    !isDone && !isActive && "text-muted-foreground"
                                )}
                            >
                                {step.replace(/^\[(MANUS|MARKETING|LINKEDIN)\]\s*/i, "")}
                            </span>
                        </li>
                    )
                })}
            </ol>
        </div>
    )
}

// ---- Message renderer ----

function MessageRow({ message }: { message: AgentMessage }) {
    switch (message.type) {
        case "thought":
            return <ThoughtBubble content={message.content} />
        case "tool_call":
            return <ToolCallBubble content={message.content} />
        case "tool_args":
            return <ToolArgsBubble content={message.content} />
        case "tool_result":
            return <ToolResultBubble content={message.content} />
        case "text":
            return <TextBubble content={message.content} />
        case "error":
            return (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {message.content}
                </div>
            )
        default:
            return null
    }
}

// ---- Main AgentFeed ----

interface AgentFeedProps {
    campaignId: string
}

export function AgentFeed({ campaignId }: AgentFeedProps) {
    const { messages, plan, isRunning, isDone } = useCampaignStream(campaignId)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages.length])

    return (
        <div className="flex flex-col gap-3 w-full max-w-3xl mx-auto py-4">
            {/* Plan tracker */}
            {plan && <PlanTracker plan={plan} />}

            {/* Status banner */}
            {isRunning && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse px-1">
                    <Loader2 className="size-4 animate-spin" />
                    Agent is working…
                </div>
            )}
            {isDone && messages.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-green-500 px-1">
                    <CheckCircle2 className="size-4" />
                    Campaign completed
                </div>
            )}

            {/* Messages */}
            {messages.length === 0 && !isRunning && (
                <div className="flex flex-col items-center gap-3 opacity-40 py-16">
                    <Globe className="size-10" />
                    <p className="text-sm text-muted-foreground">Waiting for agent activity…</p>
                </div>
            )}

            <div className="flex flex-col gap-1">
                {messages.map((msg) => (
                    <MessageRow key={msg.id} message={msg} />
                ))}
            </div>

            <div ref={bottomRef} />
        </div>
    )
}
