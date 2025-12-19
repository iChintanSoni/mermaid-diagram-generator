from mcp_server.server import mcp


def main() -> None:
    mcp.run(transport='streamable-http')
