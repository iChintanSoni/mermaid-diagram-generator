from langchain_ibm import ChatWatsonx

from a2a_agent.utils.env import Env

env = Env()

model = ChatWatsonx(
    model_id=env.LLM_MODEL,
    url=env.WATSONX_URL,
    apikey=env.WATSONX_APIKEY,
    project_id=env.WATSONX_PROJECT_ID,
)
