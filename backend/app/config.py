from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    FIREBASE_KEY_PATH = os.getenv('FIREBASE_KEY_PATH')
    FRONTEND_URL = os.getenv("FRONTEND_URL")
    # Comma-separated list of allowed origins, e.g. "http://localhost:5173,http://localhost:5174"
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", os.getenv("FRONTEND_URL", "")).split(",")
        if origin.strip()
    ]
