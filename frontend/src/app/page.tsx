import { ChatAgentHeader, ChatInput } from "@/components/features/campaigns/chat-ui";

export default function Home() {
  return (
    <div className="flex w-full flex-col h-screen">
      <ChatAgentHeader />

      {/* Main chat area */}
      <main className="flex-1 overflow-y-auto w-full p-4 flex flex-col items-center justify-center">
        <div className="max-w-3xl w-full flex flex-col items-center gap-8 opacity-50">
          <h1 className="text-3xl font-semibold tracking-tight">How can I help you today?</h1>
        </div>
        {/* Future space for messages */}
      </main>

      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ChatInput />
      </div>
    </div>
  );
}
