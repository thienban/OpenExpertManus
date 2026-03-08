"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type MessageType = "thought" | "tool_call" | "tool_args" | "tool_result" | "text" | "progress" | "error"

export interface AgentMessage {
    id: string
    type: MessageType
    content: string
    timestamp: Date
}

export interface ProgressPlan {
    plan_id: string
    title: string
    steps: string[]
    completedSteps: number[]
    activeStep: number | null
}

interface UseCampaignStreamResult {
    messages: AgentMessage[]
    plan: ProgressPlan | null
    isRunning: boolean
    isDone: boolean
}

let messageCounter = 0
const generateId = () => `msg-${++messageCounter}`

export function useCampaignStream(campaignId: string | null): UseCampaignStreamResult {
    const [messages, setMessages] = useState<AgentMessage[]>([])
    const [plan, setPlan] = useState<ProgressPlan | null>(null)
    const [isRunning, setIsRunning] = useState(false)
    const [isDone, setIsDone] = useState(false)
    const eventSourceRef = useRef<EventSource | null>(null)

    const addMessage = useCallback((type: MessageType, content: string) => {
        setMessages((prev) => [
            ...prev,
            { id: generateId(), type, content, timestamp: new Date() },
        ])
    }, [])

    const handleProgressEvent = useCallback((data: string) => {
        try {
            const payload = JSON.parse(data)

            if (payload.type === "plan_created") {
                setPlan({
                    plan_id: payload.plan_id,
                    title: payload.title,
                    steps: payload.steps,
                    completedSteps: [],
                    activeStep: null,
                })
            } else if (payload.type === "step_start") {
                setPlan((prev) => prev ? { ...prev, activeStep: payload.index } : prev)
            } else if (payload.type === "step_complete") {
                setPlan((prev) =>
                    prev
                        ? {
                            ...prev,
                            completedSteps: [...prev.completedSteps, payload.index],
                            activeStep: prev.activeStep === payload.index ? null : prev.activeStep,
                        }
                        : prev
                )
            }
        } catch {
            // ignore malformed progress payloads
        }
    }, [])

    useEffect(() => {
        if (!campaignId) return

        setMessages([])
        setPlan(null)
        setIsRunning(true)
        setIsDone(false)

        const url = `http://localhost:8000/api/v1/campaigns/${campaignId}/stream`
        const eventSource = new EventSource(url)
        eventSourceRef.current = eventSource

        eventSource.addEventListener("thought", (e) => addMessage("thought", e.data))
        eventSource.addEventListener("tool_call", (e) => addMessage("tool_call", e.data))
        eventSource.addEventListener("tool_args", (e) => addMessage("tool_args", e.data))
        eventSource.addEventListener("tool_result", (e) => addMessage("tool_result", e.data))
        eventSource.addEventListener("text", (e) => addMessage("text", e.data))
        eventSource.addEventListener("error_msg", (e) => addMessage("error", e.data))
        eventSource.addEventListener("progress", (e) => handleProgressEvent(e.data))

        eventSource.onerror = () => {
            setIsRunning(false)
            setIsDone(true)
            eventSource.close()
        }

        return () => {
            eventSource.close()
        }
    }, [campaignId, addMessage, handleProgressEvent])

    return { messages, plan, isRunning, isDone }
}
