import asyncio
import json
import sys
import traceback
from typing import List, Tuple
from langchain_community.document_loaders import WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.docstore.document import Document
from utils.logger import setup_logger
from utils.milvus import milvus_from_documents

_logger = setup_logger(__name__)

# WebPages to load
urls: List[str] = [
    "https://mermaid.ai/open-source/syntax/flowchart.html",
    "https://mermaid.ai/open-source/syntax/sequenceDiagram.html",
    "https://mermaid.ai/open-source/syntax/classDiagram.html",
    "https://mermaid.ai/open-source/syntax/stateDiagram.html",
    "https://mermaid.ai/open-source/syntax/entityRelationshipDiagram.html",
    "https://mermaid.ai/open-source/syntax/userJourney.html",
    "https://mermaid.ai/open-source/syntax/gantt.html",
    "https://mermaid.ai/open-source/syntax/pie.html",
    "https://mermaid.ai/open-source/syntax/quadrantChart.html",
    "https://mermaid.ai/open-source/syntax/requirementDiagram.html",
    "https://mermaid.ai/open-source/syntax/gitgraph.html",
    "https://mermaid.ai/open-source/syntax/c4.html",
    "https://mermaid.ai/open-source/syntax/mindmap.html",
    "https://mermaid.ai/open-source/syntax/timeline.html",
    "https://mermaid.ai/open-source/syntax/zenuml.html",
    "https://mermaid.ai/open-source/syntax/sankey.html",
    "https://mermaid.ai/open-source/syntax/xyChart.html",
    "https://mermaid.ai/open-source/syntax/block.html",
    "https://mermaid.ai/open-source/syntax/packet.html",
    "https://mermaid.ai/open-source/syntax/kanban.html",
    "https://mermaid.ai/open-source/syntax/architecture.html",
    "https://mermaid.ai/open-source/syntax/radar.html",
    "https://mermaid.ai/open-source/syntax/treemap.html",
    "https://mermaid.ai/open-source/syntax/examples.html",
    "https://mermaid.ai/open-source/config/schema-docs/config.html",
    "https://mermaid.ai/open-source/config/directives.html",
    "https://mermaid.ai/open-source/config/theming.html",
    "https://mermaid.ai/open-source/config/math.html",
    "https://mermaid.ai/open-source/config/layouts.html",
]


async def _scrape_links(links: List[str]) -> List[Document]:
    try:
        loader = WebBaseLoader(links)

        # Split into chunks - recursive splitter tries paragraphs, then sentences, then words
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,      # Average characters per chunk
            chunk_overlap=200,    # Overlap preserves context across chunks
            add_start_index=True  # Track position in original document
        )
        documents: List[Document] = []
        async for doc in loader.alazy_load():
            documents.append(doc)
        return text_splitter.split_documents(documents)
    except Exception as e:
        _logger.error(e)
        raise e


def _log_documents(documents_with_score: List[Tuple[Document, float]]):
    shortened_results = [
        {
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


async def _save_documents(documents: List[Document]):
    vector_store = milvus_from_documents(documents=documents)
    documents_with_score = await vector_store.asimilarity_search_with_score(
        "flowchart mermaid", k=5, ranker_type="weighted", ranker_params={"weights": [0.6, 0.4]}
    )
    _log_documents(documents_with_score)


async def main():
    _logger.info("Starting doc-scraper...")
    documents = await _scrape_links(urls)
    await _save_documents(documents=documents)
    _logger.info("Finished scraping docs")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        traceback.print_exc()
        sys.exit(str(e))
