import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_ENV: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # API credentials
    BRIGHT_DATA_API_KEY: str = ""
    BRIGHT_DATA_SERP_ZONE: str = ""
    BRIGHT_DATA_UNLOCKER_ZONE: str = ""
    
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    # CORS Origin List
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        
    @property
    def use_mock_pipeline(self) -> bool:
        # If API key for Groq or Gemini is missing, we default to the mock pipeline
        return not (bool(self.GROQ_API_KEY) or bool(self.GEMINI_API_KEY))

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

# Global settings instance
settings = Settings()
