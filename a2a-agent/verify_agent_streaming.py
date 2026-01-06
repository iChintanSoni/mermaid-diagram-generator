import asyncio
from a2a_agent.agent import MermaidAgent
from a2a.types import Message
from uuid import uuid4

async def test_agent_streaming():
    print("Initializing Agent...")
    agent = MermaidAgent()
    
    # Mock message
    msg = Message(
        role="user",
        parts=[{"text": "Hello, are you IBM Granite? Answer in 3 words."}],
        context_id=str(uuid4()),
        messageId=str(uuid4())
    )
    
    print("Starting stream...")
    try:
        count = 0
        async for chunk in agent.astream(msg, config={}):
            print(f"[{count}] {chunk}", end="", flush=True)
            count += 1
        print(f"\n\n--- Finished (Chunks: {count}) ---")
    except Exception as e:
        print(f"\n--- Error: {e} ---")

if __name__ == "__main__":
    asyncio.run(test_agent_streaming())
