from langchain_ollama import ChatOllama

from a2a_agent.utils.env import Env

env = Env()

model = ChatOllama(
    model=env.LLM_MODEL,
    temperature=0,
)
