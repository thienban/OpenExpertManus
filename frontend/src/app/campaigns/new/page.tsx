import { CampaignForm } from "@/components/features/campaigns/CampaignForm";

export default function NewCampaignPage() {
    return (
        <div className="flex w-full flex-col h-screen items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <h1 className="text-3xl font-bold mb-8">Start a New Campaign</h1>
                <CampaignForm />
            </div>
        </div>
    );
}
