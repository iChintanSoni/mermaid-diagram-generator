from typing import List
from utils.env import Env
from langchain_milvus import Milvus, BM25BuiltInFunction
from langchain_community.docstore.document import Document
from utils.embedding_model import embeddings

env = Env()


def milvus_from_documents(documents: List[Document]) -> Milvus:
    return Milvus.from_documents(
        documents=documents,
        embedding=embeddings,
        builtin_function=BM25BuiltInFunction(),
        # `dense` is for Ollama embeddings, `sparse` is the output field of BM25 function
        vector_field=["dense", "sparse"],
        connection_args={
            "uri": env.MILVUS_URI,
        },
        consistency_level="Strong",
        drop_old=True,
    )
