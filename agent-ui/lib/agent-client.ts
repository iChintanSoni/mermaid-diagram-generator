import { AgentCard } from "@a2a-js/sdk";
import { ClientFactory } from "@a2a-js/sdk/client";

export const fetchAgentCard = async (url: string): Promise<AgentCard | null> => {
    try {
        const factory = new ClientFactory();
        const client = await factory.createFromUrl(url);
        return await client.getAgentCard();
    } catch (error) {
        console.error("Failed to fetch agent card", error);
        return null;
    }
};
