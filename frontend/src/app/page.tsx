import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex w-full flex-col h-screen overflow-y-auto">
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
        <div className="font-semibold text-lg">Open Expert Manus Dashboard</div>
      </header>

      <main className="flex-1 w-full p-8 max-w-5xl mx-auto flex flex-col gap-8">
        <section>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back 🚀</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Manage your agent campaigns, SEO audits, and marketing tasks from here.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border rounded-xl p-6 shadow-sm flex flex-col items-start gap-4 bg-card">
              <div className="bg-primary/10 text-primary p-3 rounded-full">
                <Play className="size-6" />
              </div>
              <h2 className="text-xl font-semibold">Start New Campaign</h2>
              <p className="text-sm text-muted-foreground flex-1">
                Launch an AI Agent to automate your SEO strategy, perform data analysis, or run specialized web workflows.
              </p>
              <Button asChild className="w-full mt-4">
                <Link href="/campaigns/new">New Campaign</Link>
              </Button>
            </div>

            {/* Future Placeholder Cards */}
            <div className="border rounded-xl p-6 shadow-sm flex flex-col items-start gap-4 bg-muted/30">
              <h2 className="text-xl font-semibold opacity-70">Saved Reports</h2>
              <p className="text-sm text-muted-foreground flex-1 opacity-70">
                Browse detailed SEO audits, content generation, and exported metrics.
              </p>
              <Button disabled variant="outline" className="w-full mt-4">
                Coming Soon
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
