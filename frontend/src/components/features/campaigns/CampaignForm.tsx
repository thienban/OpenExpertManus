"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const campaignFormSchema = z.object({
    agentId: z.string().min(1, { message: "Please select an agent." }),
    keyword: z.string().min(2, {
        message: "Keyword must be at least 2 characters.",
    }),
    objectives: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one objective.",
    }),
})

type CampaignFormValues = z.infer<typeof campaignFormSchema>

const defaultValues: Partial<CampaignFormValues> = {
    agentId: "marketing",
    objectives: ["paa", "serp_audit"],
}

const marketingObjectives = [
    {
        id: "paa",
        label: "Extraire les \"People Also Ask\" (PAA)",
    },
    {
        id: "serp_audit",
        label: "Auditer la concurrence SERP",
    },
    {
        id: "linkedin",
        label: "Chercher des prospects LinkedIn",
    },
    {
        id: "save_markdown",
        label: "Sauvegarder le rapport final (.md)",
    },
]

export function CampaignForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<CampaignFormValues>({
        resolver: zodResolver(campaignFormSchema),
        defaultValues,
    })

    // Watch the selected agent to conditionally render fields
    const selectedAgentId = form.watch("agentId")

    async function onSubmit(data: CampaignFormValues) {
        setIsLoading(true)
        try {
            // Build the prompt based on objectives
            let promptText = data.keyword
                ? `Keyword: ${data.keyword}\nObjectives: ${data.objectives.join(', ')}`
                : "Execute generic marketing task";

            const payload = {
                selected_agent: data.agentId,
                prompt: promptText
            };

            const response = await fetch("http://localhost:8000/api/v1/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error("Failed to start campaign");
                return;
            }

            const result = await response.json();
            router.push(`/campaigns/${result.campaign_id}`)
        } catch (error) {
            console.error("Error starting campaign:", error);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <FormField
                    control={form.control}
                    name="agentId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Agent</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an agent to power the campaign" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="marketing">🎯 Agent Marketing</SelectItem>
                                    <SelectItem value="linkedin">💼 Agent LinkedIn</SelectItem>
                                    <SelectItem value="data_analysis">📊 Agent Data</SelectItem>
                                    <SelectItem value="manus">🤖 Manus (General Purpose)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                {selectedAgentId === "linkedin"
                                    ? "L'Agent LinkedIn utilise un vrai navigateur pour interagir avec LinkedIn."
                                    : "L'Agent Marketing est recommandé pour le SEO, la stratégie de contenu et la veille concurrentielle."}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {selectedAgentId === "marketing" && (
                    <>
                        <FormField
                            control={form.control}
                            name="keyword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mot-clé / Sujet Ciblé</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Logiciel CRM SaaS" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="objectives"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Objectifs</FormLabel>
                                        <FormDescription>
                                            Sélectionnez les actions que l'Agent Marketing doit entreprendre.
                                        </FormDescription>
                                    </div>
                                    {marketingObjectives.map((item) => (
                                        <FormField
                                            key={item.id}
                                            control={form.control}
                                            name="objectives"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        key={item.id}
                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(item.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...field.value, item.id])
                                                                        : field.onChange(
                                                                            field.value?.filter(
                                                                                (value) => value !== item.id
                                                                            )
                                                                        )
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {item.label}
                                                        </FormLabel>
                                                    </FormItem>
                                                )
                                            }}
                                        />
                                    ))}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}

                {selectedAgentId === "linkedin" && (
                    <FormField
                        control={form.control}
                        name="keyword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tâche LinkedIn</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ex: Trouver 5 fondateurs de startups AI à Paris"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Décrivez en détail ce que l'agent doit faire sur LinkedIn.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Lancement..." : "Lancer la Campagne"}
                </Button>
            </form>
        </Form>
    )
}
