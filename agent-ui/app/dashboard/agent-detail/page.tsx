"use client"

import { AgentCard } from "@a2a-js/sdk";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { H1, H2, H3, H4, P, Lead, Muted, Small } from "@/components/ui/typography"
import { Separator } from "@/components/ui/separator"
import { ArrowUpRight, Box, Cpu, Globe, Layers, MessageSquare, Plus, Zap } from "lucide-react"
import Link from "next/link"

// Mock Data for the agent detail view
const agent: AgentCard = {
    capabilities: {
        pushNotifications: false,
        streaming: true
    },
    defaultInputModes: ["text", "voice"],
    defaultOutputModes: ["text", "image"],
    description: "An advanced AI agent specialized in authoring Mermaid diagrams. It converts natural language descriptions into validated Mermaid syntax, returns diagrams embedded in Markdown, and can optionally render diagrams as SVG or PNG images.",
    name: "Mermaid Diagram Agent",
    preferredTransport: "JSONRPC",
    protocolVersion: "0.3.0",
    skills: [
        {
            description: "Generates clear, validated Mermaid diagrams from natural language. Supports flowcharts, sequence diagrams, architecture diagrams, and more.",
            examples: [
                "Create a sequence diagram for user login with OTP verification",
                "Draw an architecture diagram for a microservices-based system"
            ],
            id: "generate_mermaid_diagrams",
            name: "Mermaid Diagram Generation",
            tags: ["mermaid", "visualization", "diagrams"]
        },
        {
            description: "Validates existing Mermaid syntax and suggests fixes for errors.",
            examples: [
                "Check this mermaid code for errors",
                "Fix the syntax in this flowchart"
            ],
            id: "validate_mermaid",
            name: "Syntax Validation",
            tags: ["validation", "syntax", "error-checking"]
        }
    ],
    url: "http://127.0.0.1:4003/",
    version: "1.0.0"
}

export default function AgentDetail() {
    return (
        <div className="flex flex-col gap-8 p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <H1 className="text-left">
                                {agent.name}
                            </H1>
                            <Badge variant="outline" className="border-primary/20 text-primary">
                                v{agent.version}
                            </Badge>
                        </div>
                        <Lead>
                            {agent.description}
                        </Lead>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                            <Globe className="h-4 w-4" />
                            <a href={agent.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {agent.url}
                            </a>
                        </div>
                        <Separator orientation="vertical" className="h-4 hidden sm:block" />
                        <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                            <Layers className="h-4 w-4" />
                            <span>{agent.protocolVersion}</span>
                        </div>
                        <Separator orientation="vertical" className="h-4 hidden sm:block" />
                        <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                            <Box className="h-4 w-4" />
                            <span>{agent.preferredTransport}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0">
                    <Link href={`/dashboard/chat?url=${encodeURIComponent(agent.url)}`}>
                        <Button className="w-full md:w-auto shadow-lg hover:shadow-xl transition-all">
                            <Plus className="mr-2 h-4 w-4" />
                            Start New Chat
                        </Button>
                    </Link>
                </div>
            </div>

            <Separator />

            {/* Capabilities & Modes Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Input/Output Modes */}
                <Card className="shadow-none border-dashed h-full">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-purple-500" />
                            Interaction
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Small className="text-muted-foreground mb-3 uppercase tracking-wider">Input Modes</Small>
                            <div className="flex flex-wrap gap-2">
                                {agent.defaultInputModes.map(mode => (
                                    <Badge key={mode} variant="secondary" className="capitalize">{mode}</Badge>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Small className="text-muted-foreground mb-3 uppercase tracking-wider">Output Modes</Small>
                            <div className="flex flex-wrap gap-2">
                                {agent.defaultOutputModes.map(mode => (
                                    <Badge key={mode} variant="secondary" className="capitalize">{mode}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Capabilities */}
                <Card className="shadow-none border-dashed bg-muted/30 h-full">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            Capabilities
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-md bg-background border transition-colors hover:border-primary/20">
                            <Small>Push Notifications</Small>
                            <div className={`h-2.5 w-2.5 rounded-full ring-2 ring-offset-2 ring-offset-background ${agent.capabilities.pushNotifications ? "bg-green-500 ring-green-500/20" : "bg-zinc-300 ring-zinc-300/20"}`} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-md bg-background border transition-colors hover:border-primary/20">
                            <Small>Streaming</Small>
                            <div className={`h-2.5 w-2.5 rounded-full ring-2 ring-offset-2 ring-offset-background ${agent.capabilities.streaming ? "bg-green-500 ring-green-500/20" : "bg-zinc-300 ring-zinc-300/20"}`} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Skills Section */}
            <div className="space-y-6">
                <H2 className="flex items-center gap-2 border-none pb-0">
                    <Cpu className="h-6 w-6 text-primary" />
                    Skills
                </H2>
                <div className="grid gap-6 md:grid-cols-2">
                    {agent.skills.map((skill) => (
                        <Card key={skill.id} className="shadow-none border-dashed h-full flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <H4 className="transition-colors">{skill.name}</H4>
                                        <CardDescription className="font-mono text-xs">{skill.id}</CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="shrink-0">
                                        Skill
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-1 flex flex-col">
                                <Muted className="!mt-0">
                                    {skill.description}
                                </Muted>

                                {skill.examples && skill.examples.length > 0 && (
                                    <div className="space-y-2 bg-muted/50 p-3 rounded-lg mt-auto">
                                        <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                                            <ArrowUpRight className="h-3 w-3" /> Examples
                                        </p>
                                        <ul className="space-y-1.5">
                                            {skill.examples.map((example, i) => (
                                                <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                                                    <span className="text-primary/40 text-lg leading-none h-4">•</span>
                                                    <span className="italic">"{example}"</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-1.5 pt-2">
                                    {skill.tags && skill.tags.map(tag => (
                                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-background border text-muted-foreground transition-colors hover:text-foreground hover:border-primary/30 cursor-default">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {agent.skills.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                            <Cpu className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <P>No skills listed for this agent.</P>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}