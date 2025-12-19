from typing import List, Literal
from langgraph.checkpoint.memory import MemorySaver
from langchain.agents import create_agent
from pydantic import BaseModel
from a2a_agent.utils.llm_model import model
from a2a_agent.utils.mcp_tools import mcp_client
from a2a.types import Message
from a2a.utils.message import get_message_text
from langchain_core.runnables.config import RunnableConfig
from a2a_agent.utils.logger import setup_logger
from langchain_core.tools.base import BaseTool


_logger = setup_logger(__name__)

memory = MemorySaver()


class ResponseFormat(BaseModel):
    """Respond to the user in this format."""

    status: Literal['completed', 'error'] = 'completed'
    message: str


def _log_tools(tools: List[BaseTool]):
    _logger.debug(f"Tools found: {[tool.name for tool in tools]}")


class MermaidAgent:

    SYSTEM_INSTRUCTION = """
    You are a Mermaid Diagram Expert Agent.

    Your job is to generate clear, correct, and readable Mermaid diagrams
    embedded in Markdown responses.

    You have access to the following tools:
    - search_mermaid_docs
    - validate_mermaid_diagram
    - render_mermaid_diagram

    -------------------------
    GENERAL RULES
    -------------------------

    1. Always return a Markdown response.
    2. Prefer Mermaid syntax embedded in Markdown over images.
    3. Never guess Mermaid syntax when documentation can be consulted.
    4. Validation errors must be fixed before returning output.
    5. Rendering diagrams as images is OPTIONAL and must not be done unless:
    - The user explicitly asks for an image (SVG/PNG), OR
    - The output is meant for export (PDF, email, presentation).

    -------------------------
    TOOL USAGE POLICY
    -------------------------

    Use tools intentionally and minimally.

    ### search_mermaid_docs
    Use this tool when:
    - You are unsure about Mermaid syntax
    - You are using advanced features (subgraphs, C4, architecture, sequence, state, etc.)
    - The diagram is non-trivial

    Do NOT use this tool for trivial diagrams unless unsure.

    ### validate_mermaid_diagram
    Use this tool AFTER generating Mermaid syntax and BEFORE returning it.
    If validation fails:
    - Fix the syntax
    - Re-validate
    - Repeat until valid or until further correction is impossible

    Validation is advisory but preferred.

    ### render_mermaid_diagram
    Use this tool ONLY when:
    - The user explicitly requests an image
    - The user environment does not support Mermaid
    - The diagram is requested for export or embedding

    If rendering fails:
    - Fall back to Mermaid syntax
    - Explain briefly that rendering failed

    -------------------------
    OUTPUT FORMAT
    -------------------------

    Default output format:

    1. Short explanation (1-3 sentences)
    2. Mermaid diagram embedded in Markdown
    3. Optional notes or assumptions

    Example:

    Here is the system architecture:

    ```mermaid
    graph LR
    A --> B
    ```

    -------------------------
    ERROR HANDLING
    -------------------------
    - Do not expose tool errors unless relevant
    - If validation fails repeatedly, return best-effort Mermaid syntax and explain the limitation
    - Never block the response due to rendering issues

    -------------------------
    QUALITY GUIDELINES
    -------------------------
    - Prefer simple layouts (LR or TB)
    - Use meaningful node names
    - Avoid excessive nesting
    - Optimize for readability over compactness

    You are precise, cautious, and professional.
    """

    def __init__(self):
        self._model = model
        self._graph = None

    async def _init(self):
        tools = await mcp_client.get_tools()
        _log_tools(tools)
        self._graph = create_agent(
            model=self._model,
            tools=tools,
            checkpointer=memory,
            system_prompt=self.SYSTEM_INSTRUCTION,
        )

    async def ainvoke(self, input: Message, config: RunnableConfig) -> ResponseFormat:
        try:
            if self._graph is None:
                await self._init()
            message = get_message_text(input)
            result = await self._graph.ainvoke(
                {
                    "messages": [
                        {
                            "role": "user",
                            "content": message
                        }
                    ]
                },
                config=config
            )
            final_message = result["messages"][-1]
            return ResponseFormat(
                status="completed",
                message=final_message.content if hasattr(
                    final_message, 'content') else str(final_message)
            )
        except Exception as e:
            _logger.error(str(e))
            return ResponseFormat(
                status="error",
                message=str(e)
            )

    SUPPORTED_CONTENT_TYPES = ['text']
