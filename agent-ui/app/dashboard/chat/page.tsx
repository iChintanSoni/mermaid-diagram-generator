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
import { ArrowUpIcon } from "lucide-react";

type Message = {
  type: "user" | "assistant";
  content: string;
};
const messages: Message[] = [
  {
    type: "assistant",
    content: `Sure! Here's a simple flow:

\`\`\`mermaid
graph TD
  A[User] --> B[Chat UI]
  B --> C[MarkdownViewer]
\`\`\`

You can also render images:

![Diagram](https://placehold.co/400x200)`,
  },
  {
    type: "user",
    content: "Can you show me a Mermaid diagram?",
  },
];

export default function ChatPage() {
  return (
    <div className="flex flex-1 flex-col h-screen rounded-md gap-4">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length ? (
          messages.map((message, index) => {
            const isUser = message.type === "user";
            return (
              <div
                key={index}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`w-full max-w-xs lg:max-w-11/12 px-4 py-2 rounded-2xl text-sm ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <MarkdownViewer markdown={message.content} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex h-full items-center justify-center">
            <Large>Hi Chintan! How can I help you today?</Large>
          </div>
        )}
      </div>

      {/* Sticky input at bottom */}
      <form>
        <InputGroup>
          <InputGroupTextarea placeholder="Ask, Search or Chat..." />
          <InputGroupAddon align="block-end">
            <InputGroupButton
              variant="outline"
              className="rounded-full"
              size="icon-xs"
            >
              <IconPlus />
            </InputGroupButton>
            <InputGroupText className="ml-auto">10/100</InputGroupText>
            <Separator orientation="vertical" className="h-4" />
            <InputGroupButton
              variant="default"
              className="rounded-full"
              size="icon-xs"
              disabled
            >
              <ArrowUpIcon /> <span className="sr-only">Send</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
}
