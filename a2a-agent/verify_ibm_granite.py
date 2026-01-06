from a2a_agent.utils.llm_model import model
import sys
import asyncio

async def test_streaming():
    print("Testing streaming connection to IBM Granite...")
    try:
        print("\n--- Streaming Response ---")
        async for chunk in model.astream("Hello, are you IBM Granite? Answer in 3 words."):
            print(chunk.content, end="", flush=True)
        print("\n\n--- Success ---")
    except Exception as e:
        print("\n--- Error ---")
        print(e)
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(test_streaming())
