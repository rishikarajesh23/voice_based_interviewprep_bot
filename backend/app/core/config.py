from pydantic_settings import BaseSettings
from typing import Optional
import urllib.parse

class Settings(BaseSettings):
    # MongoDB Atlas URL from environment variable
    mongodb_url: str
    database_name: str = "preptalk"
    google_api_key: str
    firebase_credentials_path: str = "./firebase-credentials.json"
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env"
    
    def get_database_url(self):
        """Get properly formatted database URL"""
        # If password contains special characters, it should already be encoded in .env
        return self.mongodb_url

settings = Settings()