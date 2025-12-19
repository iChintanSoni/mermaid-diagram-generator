
from langchain_ollama import OllamaEmbeddings
from mcp_server.utils.env import Env
from mcp_server.utils.logger import setup_logger

env = Env()

_logger = setup_logger(__name__)

_logger.debug(
    f"Initiating Ollama Embedding Model with id: {env.EMBEDDING_MODEL}")
embeddings = OllamaEmbeddings(model=env.EMBEDDING_MODEL)
_logger.debug(
    f"Initiated successfully")
