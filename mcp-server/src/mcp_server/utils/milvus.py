from mcp_server.utils.env import Env
from langchain_milvus import Milvus, BM25BuiltInFunction
from mcp_server.utils.embedding_model import embeddings

env = Env()


class MilvusManager:

    def __init__(self):
        self._vector_store = None

    def init(self):
        self._vector_store = Milvus(
            embedding_function=embeddings,
            builtin_function=BM25BuiltInFunction(),
            # `dense` is for Ollama embeddings, `sparse` is the output field of BM25 function
            vector_field=["dense", "sparse"],
            connection_args={
                "uri": env.MILVUS_URI,
            },
            consistency_level="Strong",
        )

    async def query(self, query: str, k: int = 4):
        if self._vector_store is None:
            self.init()
        return await self._vector_store.asimilarity_search_with_score(
            query, k=k, ranker_type="weighted", ranker_params={"weights": [0.6, 0.4]}
        )
