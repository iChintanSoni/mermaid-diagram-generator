from pydantic_settings import BaseSettings, SettingsConfigDict


class Env(BaseSettings):
    HOST: str
    PORT: int

    LLM_MODEL: str
    MERMAID_MCP_SERVER_URL: str

    model_config = SettingsConfigDict(
        env_file=".env"
    )
