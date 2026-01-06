from pydantic_settings import BaseSettings, SettingsConfigDict


class Env(BaseSettings):
    HOST: str
    PORT: int

    LLM_MODEL: str = "ibm/granite-4-h-small"
    REDIS_URL: str
    MERMAID_MCP_SERVER_URL: str

    WATSONX_APIKEY: str
    WATSONX_PROJECT_ID: str
    WATSONX_URL: str

    model_config = SettingsConfigDict(
        env_file=".env"
    )
