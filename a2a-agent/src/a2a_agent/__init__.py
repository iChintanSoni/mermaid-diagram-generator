import sys
import click
import uvicorn
from a2a.server.apps import A2AStarletteApplication
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from a2a.types import (
    AgentCapabilities,
    AgentCard,
    AgentSkill,
)
from a2a_agent.agent import MermaidAgent
from a2a_agent.agent_executor import MermaidAgentExecutor
from a2a_agent.utils.env import Env
from a2a_agent.utils.logger import setup_logger

_logger = setup_logger(__name__)

env = Env()


@click.command()
@click.option('--host', 'host', default=env.HOST)
@click.option('--port', 'port', default=env.PORT)
def main(host: str, port: int):
    """Starts the Mermaid Diagram Agent server."""
    try:
        capabilities = AgentCapabilities(
            streaming=False,
            push_notifications=False
        )
        skill = AgentSkill(
            id="generate_mermaid_diagrams",
            name="Mermaid Diagram Generation & Validation",
            description=(
                "Generates clear, validated Mermaid diagrams from natural language. "
                "Supports flowcharts, sequence diagrams, architecture diagrams, and more. "
                "Can embed diagrams in Markdown or render them as SVG/PNG when requested."
            ),
            tags=[
                "mermaid",
                "diagrams",
                "architecture diagrams",
                "sequence diagrams",
                "flowcharts",
                "markdown",
                "visualization",
            ],
            examples=[
                "Create a sequence diagram for user login with OTP verification",
                "Draw an architecture diagram for a microservices-based system",
                "Generate a flowchart for order processing",
                "Validate this Mermaid diagram and fix errors",
                "Render this Mermaid diagram as an SVG image",
            ],
        )
        agent_card = AgentCard(
            name="Mermaid Diagram Agent",
            description=(
                "An AI agent specialized in authoring Mermaid diagrams. "
                "It converts natural language descriptions into validated Mermaid syntax, "
                "returns diagrams embedded in Markdown, and can optionally render diagrams "
                "as SVG or PNG images. Ideal for documentation, architecture design, and "
                "technical explanations."
            ),
            url=f"http://{host}:{port}/",
            version="1.0.0",
            default_input_modes=MermaidAgent.SUPPORTED_CONTENT_TYPES,
            default_output_modes=MermaidAgent.SUPPORTED_CONTENT_TYPES,
            capabilities=capabilities,
            skills=[skill],
        )

        request_handler = DefaultRequestHandler(
            agent_executor=MermaidAgentExecutor(),
            task_store=InMemoryTaskStore(),
        )
        server = A2AStarletteApplication(
            agent_card=agent_card, http_handler=request_handler
        )

        uvicorn.run(server.build(), host=host, port=port)
    except Exception as e:
        _logger.error(f'An error occurred during server startup: {e}')
        sys.exit(1)


if __name__ == '__main__':
    main()
