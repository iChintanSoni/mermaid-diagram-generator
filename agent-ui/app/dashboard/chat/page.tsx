
import { Suspense } from "react";
import { fetchAgentCard } from "@/lib/agent-client";
import { getSession as getSessionAction } from "@/app/actions/history";
import ChatClient from "./chat-client";
import { AgentCard } from "@a2a-js/sdk";
import { ChatSession } from "@/lib/db";

interface PageProps {
  searchParams: Promise<{
    url?: string;
    sessionId?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const { url, sessionId } = params;

  let initialAgent: AgentCard | null = null;
  let initialSession: ChatSession | null = null;

  if (sessionId) {
    // Load existing session
    const session = await getSessionAction(sessionId);
    if (session) {
      initialSession = session as ChatSession;
      if (session.agentUrl) {
        initialAgent = await fetchAgentCard(session.agentUrl);
      }
    }
  } else if (url) {
    // New chat with agent
    initialAgent = await fetchAgentCard(url);
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          Loading chat...
        </div>
      }
    >
      <ChatClient
        initialAgent={initialAgent}
        initialSession={initialSession}
        agentUrl={url || null}
        sessionId={sessionId || null}
      />
    </Suspense>
  );
}
