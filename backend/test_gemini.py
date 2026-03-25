import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# Configure with your API key from .env
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# List available models
models = genai.list_models()

print("Available Gemini Models:")
for model in models:
    print(model.name)
