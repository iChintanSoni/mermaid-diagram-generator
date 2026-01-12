import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { type AgentCard, type Message, AGENT_CARD_PATH } from '@a2a-js/sdk';
import {
    type AgentExecutor,
    RequestContext,
    type ExecutionEventBus,
    DefaultRequestHandler,
    InMemoryTaskStore,
} from '@a2a-js/sdk/server';
import { agentCardHandler, jsonRpcHandler, restHandler, UserBuilder } from '@a2a-js/sdk/server/express';
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { Milvus } from "@langchain/community/vectorstores/milvus";
import { HumanMessage } from "@langchain/core/messages";

// 1. Define your agent's identity card.
const helloAgentCard: AgentCard = {
    name: 'Hello Agent',
    description: 'A simple agent that says hello.',
    protocolVersion: '0.3.0',
    version: '0.1.0',
    url: 'http://localhost:4000/a2a/jsonrpc', // The public URL of your agent server
    skills: [{ id: 'chat', name: 'Chat', description: 'Say hello', tags: ['chat'] }],
    capabilities: {
        pushNotifications: false,
    },
    defaultInputModes: ['text'],
    defaultOutputModes: ['text'],
    additionalInterfaces: [
        { url: 'http://localhost:4000/a2a/jsonrpc', transport: 'JSONRPC' }, // Default JSON-RPC transport
        { url: 'http://localhost:4000/a2a/rest', transport: 'HTTP+JSON' }, // HTTP+JSON/REST transport
    ],
};

// 2. Implement the agent's logic.
// 2. Implement the agent's logic.
class HelloExecutor implements AgentExecutor {
    private chatModel: ChatOllama;
    // @ts-ignore
    private vectorStore: Milvus | undefined;

    constructor() {
        this.chatModel = new ChatOllama({
            model: "ministral-3:3b",
        });

        // Initialize Milvus asynchronously
        this.initMilvus();
    }

    private async initMilvus() {
        try {
            const embeddings = new OllamaEmbeddings({
                model: "nomic-embed-text-v2-moe:latest",
            });

            this.vectorStore = await Milvus.fromTexts(
                ["Hello world!", "Bye world!", "Hello there!"],
                [{ id: 1 }, { id: 2 }, { id: 3 }],
                embeddings,

                {
                    collectionName: "a2a_agent_collection",
                    url: "http://localhost:19530",
                }
            );
            console.log("Milvus initialized successfully");
        } catch (error) {
            console.error("Failed to initialize Milvus:", error);
        }
    }

    async execute(requestContext: RequestContext, eventBus: ExecutionEventBus): Promise<void> {
        // Extract the user's message from the request context
        // In a real scenario, you'd parse requestContext.input or similar
        // For this example, we'll assume a simple text input or default greeting

        // TODO: Access actual user input from requestContext if available in future SDK versions
        // For now, we'll use a placeholder or check if we can get input.
        // As per SDK, input might be in `requestContext` but exact field depends on transport.
        // We will assume 'Hello' if no input found for this demo.

        const userMessage = "Hello from A2A User";

        try {
            const response = await this.chatModel.invoke([
                new HumanMessage(userMessage),
            ]);

            const responseText = typeof response.content === 'string' ? response.content : "I couldn't process that.";

            const responseMessage: Message = {
                kind: 'message',
                messageId: uuidv4(),
                role: 'agent',
                parts: [{ kind: 'text', text: responseText }],
                contextId: requestContext.contextId,
            };

            eventBus.publish(responseMessage);
            eventBus.finished();

        } catch (error) {
            console.error("Error executing agent:", error);
            eventBus.finished();
        }
    }

    // cancelTask is not needed for this simple agent.
    cancelTask = async (): Promise<void> => { };
}

// 3. Set up and run the server.
const agentExecutor = new HelloExecutor();
const requestHandler = new DefaultRequestHandler(
    helloAgentCard,
    new InMemoryTaskStore(),
    agentExecutor
);

const app = express();

app.use(`/${AGENT_CARD_PATH}`, agentCardHandler({ agentCardProvider: requestHandler }));
app.use('/a2a/jsonrpc', jsonRpcHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));
app.use('/a2a/rest', restHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));

app.listen(4005, () => {
    console.log(`🚀 Server started on http://localhost:4000`);
});