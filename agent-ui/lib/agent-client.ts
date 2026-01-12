import { AgentCard } from "@a2a-js/sdk";
import {
    ClientFactory,
    ClientFactoryOptions,
    JsonRpcTransportFactory,
    RestTransportFactory
} from "@a2a-js/sdk/client";

// Re-usable fetch implementation that ensures streams are patched
const patchedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    // Force usage of window.fetch if available (to hit our global polyfills if any)
    // or fallback to global fetch.
    const f = typeof window !== 'undefined' ? window.fetch : fetch;
    const response = await f(input, init);

    // Explicitly ensure pipeThrough exists on the response body
    if (response.body && typeof response.body.pipeThrough !== 'function') {
        console.log("[ClientFactory] Patching missing pipeThrough on response.body");
        (response.body as any).pipeThrough = function <T, R>(
            transform: { writable: WritableStream<T>; readable: ReadableStream<R> },
            options?: StreamPipeOptions
        ): ReadableStream<R> {
            // Polyfill pipeThrough using pipeTo
            const This = this as ReadableStream<T>;
            if (typeof This.pipeTo === 'function') {
                This.pipeTo(transform.writable, options);
            } else {
                // Deep fallback: Reader/Writer manual piping
                const reader = This.getReader();
                const writer = transform.writable.getWriter();
                (async () => {
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            await writer.write(value);
                        }
                        await writer.close();
                    } catch (e) {
                        await writer.abort(e);
                    }
                })();
            }
            return transform.readable;
        };
    }
    return response;
};

export const createClientFactory = () => {
    return new ClientFactory(
        ClientFactoryOptions.createFrom(ClientFactoryOptions.default, {
            transports: [
                new JsonRpcTransportFactory({ fetchImpl: patchedFetch }),
                new RestTransportFactory({ fetchImpl: patchedFetch }),
            ],
        })
    );
};

export const fetchAgentCard = async (url: string): Promise<AgentCard | null> => {
    try {
        const factory = createClientFactory();
        const client = await factory.createFromUrl(url);
        return await client.getAgentCard();
    } catch (error) {
        console.error("Failed to fetch agent card", error);
        return null;
    }
};
