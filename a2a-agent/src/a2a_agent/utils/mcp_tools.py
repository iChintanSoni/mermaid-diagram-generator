from langchain_mcp_adapters.client import MultiServerMCPClient


mcp_client = MultiServerMCPClient(
    {
        "mermaid": {
            "transport": "http",
            "url": "http://127.0.0.1:4000/mcp",
        }
    }
)
