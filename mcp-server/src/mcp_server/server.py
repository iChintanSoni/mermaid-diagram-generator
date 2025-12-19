import base64
import asyncio
import json
from pathlib import Path
import tempfile
from typing import Dict, List, Literal, Optional, Tuple
from mcp.server.fastmcp import FastMCP
from mcp_server.utils.logger import setup_logger
from mcp_server.utils.env import Env
from langchain_community.docstore.document import Document
from mcp_server.utils.milvus import MilvusManager

env = Env()

_logger = setup_logger(__name__)

mcp = FastMCP(
    "Mermaid MCP Server",
    debug=True,
    host=env.HOST,
    port=env.PORT
)

milvus_manager = MilvusManager()


def log_documents(documents_with_score: List[Tuple[Document, float]]):
    shortened_results = [
        doc.model_dump() | {
            "title":  doc.metadata.get("title"),
            "content": doc.page_content[:100],
            "score": f"{score:3f}"
        }
        for doc, score in documents_with_score
    ]
    _logger.debug(
        "Search Results:\n%s",
        json.dumps(shortened_results, indent=4)
    )


@mcp.tool(
    name="search_mermaid_docs",
    description=(
        "Search official Mermaid documentation and curated references. "
        "Returns authoritative syntax rules, examples, errors, and limitations. "
        "Use this tool before generating or validating Mermaid diagrams."
    ),
    structured_output=True,
)
async def search_mermaid_docs(
        query: str
) -> List[Dict]:
    _logger.debug(f"Query: {query}")
    documents_with_score = await milvus_manager.query(query, k=3)
    log_documents(documents_with_score)
    return [{"content": doc.page_content} for doc, _ in documents_with_score]


@mcp.tool(
    name="validate_mermaid_diagram",
    description=(
        "Validate Mermaid diagram syntax using the official Mermaid CLI. "
        "Returns whether the diagram is valid and provides CLI error messages if invalid."
    ),
    structured_output=True,
)
async def validate_mermaid_diagram(mermaid_code: str) -> Dict:
    """
    Validate Mermaid diagram by invoking mermaid-cli (mmdc).
    """

    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir = Path(tmpdir)

        input_file = tmpdir / "diagram.mmd"
        output_file = tmpdir / "diagram.svg"

        input_file.write_text(mermaid_code, encoding="utf-8")

        cmd = [
            "mmdc",
            "-i", str(input_file),
            "-o", str(output_file),
            "--quiet"
        ]

        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=5
                )
            except asyncio.TimeoutError:
                process.kill()
                return {
                    "valid": False,
                    "errors": ["Mermaid validation timed out"],
                    "warnings": [],
                }

            if process.returncode == 0:
                return {
                    "valid": True,
                    "errors": [],
                    "warnings": [],
                }

            # Mermaid CLI writes all syntax errors to stderr
            error_message = stderr.decode("utf-8").strip()

            return {
                "valid": False,
                "errors": [error_message] if error_message else ["Unknown Mermaid CLI error"],
                "warnings": [],
            }

        except FileNotFoundError:
            _logger.error("Mermaid CLI (mmdc) not found")

            return {
                "valid": False,
                "errors": [
                    "Mermaid CLI (mmdc) is not installed or not available in PATH"
                ],
                "warnings": [],
            }

        except Exception as e:
            _logger.exception(
                "Unexpected error while validating Mermaid diagram")

            return {
                "valid": False,
                "errors": [str(e)],
                "warnings": [],
            }


@mcp.tool(
    name="render_mermaid_diagram",
    description=(
        "Render a Mermaid diagram into an image (SVG or PNG) using Mermaid CLI. "
        "Returns a base64-encoded image suitable for embedding in Markdown."
    ),
    structured_output=True,
)
async def render_mermaid_diagram(
    mermaid_code: str,
    format: Literal["svg", "png", "pdf"] = "svg",
    theme: Literal["default", "dark", "neutral", "forest"] = "default",
    background: Literal["transparent", "white"] = "transparent",
    timeout_seconds: int = 8,
) -> Dict:
    """
    Render Mermaid diagram via mermaid-cli (mmdc).
    """

    if format not in {"svg", "png", "pdf"}:
        return {
            "success": False,
            "error": f"Unsupported format '{format}'. Use 'svg', 'png' or 'pdf'."
        }

    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir = Path(tmpdir)

        input_file = tmpdir / "diagram.mmd"
        output_file = tmpdir / f"diagram.{format}"

        input_file.write_text(mermaid_code, encoding="utf-8")

        cmd = [
            "mmdc",
            "-i", str(input_file),
            "-o", str(output_file),
            "--quiet",
        ]

        # Optional rendering tweaks
        if theme:
            cmd.extend(["-t", theme])

        if background != "transparent":
            cmd.extend(["-b", background])

        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=timeout_seconds
                )
            except asyncio.TimeoutError:
                process.kill()
                return {
                    "success": False,
                    "error": "Mermaid rendering timed out"
                }

            if process.returncode != 0:
                error_message = stderr.decode("utf-8").strip()
                return {
                    "success": False,
                    "error": error_message or "Mermaid CLI failed to render diagram"
                }

            # Read rendered image
            image_bytes = output_file.read_bytes()
            image_base64 = base64.b64encode(image_bytes).decode("utf-8")

            return {
                "success": True,
                "format": format,
                "mime_type": (
                    "image/svg+xml" if format == "svg" else "image/png"
                ),
                "data_base64": image_base64,
            }

        except FileNotFoundError:
            _logger.error("Mermaid CLI (mmdc) not found")
            return {
                "success": False,
                "error": "Mermaid CLI (mmdc) is not installed or not in PATH"
            }

        except Exception as e:
            _logger.exception(
                "Unexpected error while rendering Mermaid diagram")
            return {
                "success": False,
                "error": str(e)
            }
