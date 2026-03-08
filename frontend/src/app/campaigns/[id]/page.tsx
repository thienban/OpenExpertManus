import { ChatAgentHeader, ChatInput } from "@/components/features/campaigns/chat-ui";

interface CampaignChatPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function CampaignChatPage({ params }: CampaignChatPageProps) {
    const resolvedParams = await params;

    return (
        <div className="flex w-full flex-col h-screen">
            <ChatAgentHeader />

            {/* Main chat area */}
            <main className="flex-1 overflow-y-auto w-full p-4 flex flex-col items-center justify-center">
                <div className="max-w-3xl w-full flex flex-col items-center gap-8 opacity-50">
                    <h1 className="text-3xl font-semibold tracking-tight">Campaign {resolvedParams.id}</h1>
                    <p className="text-muted-foreground text-center">
                        This is the chat interface. Run your prompts below to continue the campaign.
                    </p>
                </div>
                {/* Placeholder for messages mapped from useChat() in the future */}
            </main>

            <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <ChatInput />
            </div>
        </div>
    );
}
