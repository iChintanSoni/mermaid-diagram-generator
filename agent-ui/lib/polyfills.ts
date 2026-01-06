if (typeof window !== "undefined") {
    // Polyfill TextDecoderStream if missing
    if (!window.TextDecoderStream) {
        class TextDecoderStreamPolyfill {
            readable: ReadableStream<string>;
            writable: WritableStream<BufferSource>;
            decoder: TextDecoder;

            constructor(encoding = "utf-8", options?: TextDecoderOptions) {
                this.decoder = new TextDecoder(encoding, options);
                const transformStream = new TransformStream<BufferSource, string>({
                    transform: (chunk, controller) => {
                        const text = this.decoder.decode(chunk, { stream: true });
                        if (text) {
                            controller.enqueue(text);
                        }
                    },
                    flush: (controller) => {
                        const text = this.decoder.decode();
                        if (text) {
                            controller.enqueue(text);
                        }
                    },
                });
                this.readable = transformStream.readable;
                this.writable = transformStream.writable;
            }
        }
        (window as any).TextDecoderStream = TextDecoderStreamPolyfill;
    }

    // Helper to attach pipeThrough to a ReadableStream instance
    const attachPipeThrough = (stream: ReadableStream) => {
        if (stream && typeof stream.pipeThrough !== "function") {
            stream.pipeThrough = function <T, R>(
                transform: { writable: WritableStream<T>; readable: ReadableStream<R> },
                options?: StreamPipeOptions
            ): ReadableStream<R> {
                this.pipeTo(transform.writable, options);
                return transform.readable;
            };
        }
    };

    // Polyfill ReadableStream.prototype.pipeThrough if missing
    if (
        typeof ReadableStream !== "undefined" &&
        ReadableStream.prototype &&
        !ReadableStream.prototype.pipeThrough
    ) {
        (ReadableStream.prototype as any).pipeThrough = function <T, R>(
            transform: { writable: WritableStream<T>; readable: ReadableStream<R> },
            options?: StreamPipeOptions
        ): ReadableStream<R> {
            this.pipeTo(transform.writable, options);
            return transform.readable;
        };
    }

    // Monkey-patch fetch to ensure response.body has pipeThrough
    const originalFetch = window.fetch;
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
        const response = await originalFetch(input, init);
        if (response.body) {
            attachPipeThrough(response.body);
        }
        return response;
    };
}
