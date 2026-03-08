import { AgentFeed } from "@/components/features/campaigns/AgentFeed";
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

            {/* Live feed */}
            <main className="flex-1 overflow-y-auto w-full px-4">
                <AgentFeed campaignId={resolvedParams.id} />
            </main>

            <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <ChatInput />
            </div>
        </div>
    );
}
