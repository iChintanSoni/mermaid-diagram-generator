from pydantic_settings import BaseSettings, SettingsConfigDict


class Env(BaseSettings):
    EMBEDDING_MODEL: str
    MILVUS_URI: str

    model_config = SettingsConfigDict(
        env_file=".env"
    )
