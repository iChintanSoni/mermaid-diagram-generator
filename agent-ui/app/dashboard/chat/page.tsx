"use client";

import { MarkdownViewer } from "@/components/MarkdownViewer";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Large } from "@/components/ui/typography";
import { Separator } from "@radix-ui/react-separator";
import { IconPlus } from "@tabler/icons-react";
import { ArrowUpIcon, Bot, User } from "lucide-react";
import { useEffect, useState, useRef, FormEvent, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { sendMessageStream, setActiveAgent, resetChat, ChatMessage, loadSession } from "@/lib/features/chat-slice";
import { fetchAgentCard } from "@/lib/agent-client";
import { useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function ChatContent() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const agentUrl = searchParams?.get("url");
  const sessionId = searchParams?.get("sessionId");

  const { messages, isStreaming, activeAgent, activeAgentUrl } = useSelector((state: RootState) => state.chat);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  // Initialize Chat (Session or New)
  useEffect(() => {
    if (sessionId) {
      // Load existing session
      dispatch(loadSession(sessionId))
        .unwrap()
        .then((session) => {
          if (session.agentUrl) {
            // Fetch latest agent card info for the header
            fetchAgentCard(session.agentUrl).then(card => {
              dispatch(setActiveAgent({ url: session.agentUrl, agent: card }));
            });
          }
        })
        .catch(err => console.error("Failed to load session", err));
    } else if (agentUrl && agentUrl !== activeAgentUrl) {
      // Start new chat with agent
      dispatch(resetChat());

      fetchAgentCard(agentUrl).then(card => {
        dispatch(setActiveAgent({ url: agentUrl, agent: card }));
      });
    }
  }, [sessionId, agentUrl, dispatch]);

  const scrollToBottom = () => {
    // ScrollArea uses a viewport div internally, but we can try scrolling the end ref
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || (!activeAgentUrl && !sessionId) || isStreaming) return;

    if (!activeAgentUrl) {
      alert("Please wait for agent to load.");
      return;
    }

    dispatch(sendMessageStream({ text: inputText, agentUrl: activeAgentUrl }));
    setInputText("");
  };

  const handleExampleClick = (text: string) => {
    if (!activeAgentUrl || isStreaming) return;
    dispatch(sendMessageStream({ text, agentUrl: activeAgentUrl }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const examples = activeAgent?.skills?.flatMap(s => s.examples || []) || [];

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden relative">
      <ScrollArea className="flex-1 h-full px-4 pt-4 pb-0">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-40">
          {messages.length > 0 ? (
            messages.map((message: ChatMessage) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar className="h-8 w-8 mt-1 border">
                    {isUser ? (
                      <AvatarFallback className="bg-primary/10 text-primary"><User className="h-4 w-4" /></AvatarFallback>
                    ) : (
                      <>
                        {/* Keep AvatarImage for when agent has iconUrl, fallback to Bot */}
                        {/* activeAgent object might be null if loading history without context, so fallback safely */}
                        <AvatarFallback className="bg-muted text-muted-foreground"><Bot className="h-4 w-4" /></AvatarFallback>
                      </>
                    )}
                  </Avatar>

                  <div
                    className={`flex-1 max-w-[85%] rounded-2xl px-6 py-4 text-sm shadow-sm ${isUser
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border text-card-foreground rounded-tl-sm"
                      }`}
                  >
                    <div className="space-y-2">
                      {isUser ? (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      ) : (
                        <MarkdownViewer markdown={message.content} />
                      )}

                      {!isUser && message.events && message.events.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-1.5">
                          {message.events.map((event: any, i) => {
                            if (event.kind === "status-update") {
                              return (
                                <div key={i} className="flex items-center gap-2 opacity-80">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                  <span className="font-medium">{event.status?.status || "Processing"}</span>
                                  <span className="text-muted-foreground/70 hidden sm:inline">- {event.status?.description || event.taskId}</span>
                                </div>
                              );
                            }
                            if (event.kind === "artifact-update") {
                              return (
                                <div key={i} className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  <span>Artifact: <span className="font-semibold">{event.artifact?.name || "Unknown"}</span></span>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center text-center mt-20 px-4">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Bot className="h-10 w-10 text-muted-foreground" />
              </div>
              <Large className="mb-2">
                {activeAgent ? `Chat with ${activeAgent.name}` : "Select an Agent"}
              </Large>
              <p className="text-muted-foreground max-w-md mx-auto">
                {activeAgent ? (activeAgent.description || "Start a conversation to see what this agent can do.") : "Choose an agent from the sidebar to start a new chat."}
              </p>

              {activeAgent && examples.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full max-w-2xl">
                  {examples.map((example, i) => (
                    <button
                      key={i}
                      className="p-3 text-sm text-left border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all bg-card shadow-sm"
                      onClick={() => handleExampleClick(example)}
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </ScrollArea>

      {/* Floating Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-10">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <InputGroup className="shadow-lg border-primary/20 bg-card rounded-xl overflow-hidden ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
              <InputGroupTextarea
                placeholder={activeAgent ? "Ask anything..." : "Select an agent first..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!activeAgentUrl || isStreaming}
                className="min-h-[60px] max-h-[200px] border-0 focus-visible:ring-0 resize-none py-4"
              />
              <InputGroupAddon align="block-end" className="pr-2 pb-2">
                <InputGroupText className="text-xs text-muted-foreground mr-2 self-end pb-2">{inputText.length}/2000</InputGroupText>
                <InputGroupButton
                  variant="default"
                  className="rounded-lg h-9 w-9 self-end mb-1"
                  size="icon-sm"
                  type="submit"
                  disabled={!inputText.trim() || !activeAgentUrl || isStreaming}
                >
                  <ArrowUpIcon className="h-4 w-4" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>

            <div className="text-center mt-2">
              <p className="text-[10px] text-muted-foreground">
                AI-generated content may be incorrect.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
