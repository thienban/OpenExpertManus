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
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"

const campaignFormSchema = z.object({
    agentId: z.string({
        required_error: "Please select an agent.",
    }),
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

    const form = useForm<CampaignFormValues>({
        resolver: zodResolver(campaignFormSchema),
        defaultValues,
    })

    // Watch the selected agent to conditionally render fields
    const selectedAgentId = form.watch("agentId")

    function onSubmit(data: CampaignFormValues) {
        // Navigate to a new campaign running interface with the ID.
        // In a real app, you would POST this to the backend, get a run ID, and then route to it.
        // For now, we mock generating an ID and passing payload via context or URL params
        // (though URL params not recommended for full payload).
        const mockRunId = "run_" + Math.random().toString(36).substring(7);

        // Send state to router or store, here just pushing to the placeholder path
        router.push(`/campaigns/${mockRunId}`)
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
                                    <SelectItem value="marketing">Agent Marketing</SelectItem>
                                    <SelectItem value="data_analysis">Agent Data</SelectItem>
                                    <SelectItem value="manus">Manus (General Purpose)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                L'Agent Marketing est recommandé pour le SEO, la stratégie de contenu et la veille concurrentielle.
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

                <Button type="submit">Lancer la Campagne</Button>
            </form>
        </Form>
    )
}
