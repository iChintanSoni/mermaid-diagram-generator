from pydantic_settings import BaseSettings, SettingsConfigDict


class Env(BaseSettings):
    HOST: str
    PORT: int

    LLM_MODEL: str
    REDIS_URL: str
    MERMAID_MCP_SERVER_URL: str
    OLLAMA_BASE_URL: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env"
    )
