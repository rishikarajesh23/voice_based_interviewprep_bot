import spacy
from typing import List
import google.generativeai as genai
from app.core.config import settings

# Load spaCy model (download with: python -m spacy download en_core_web_sm)
try:
    nlp = spacy.load("en_core_web_sm")
except:
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

genai.configure(api_key=settings.google_api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

async def extract_keywords_spacy(text: str) -> List[str]:
    """Extract keywords using spaCy"""
    doc = nlp(text)
    keywords = []
    
    # Extract nouns and proper nouns
    for token in doc:
        if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop:
            keywords.append(token.text.lower())
    
    # Extract named entities
    for ent in doc.ents:
        keywords.append(ent.text.lower())
    
    return list(set(keywords))

async def extract_keywords_gemini(text: str) -> List[str]:
    """Extract keywords using Gemini as fallback"""
    try:
        prompt = f"""
        Extract 3-5 important keywords from the following text that would be useful for generating follow-up interview questions:
        
        "{text}"
        
        Return only the keywords separated by commas, nothing else.
        """
        
        response = model.generate_content(prompt)
        keywords = [k.strip().lower() for k in response.text.strip().split(',')]
        return keywords
    except Exception as e:
        print(f"Error extracting keywords with Gemini: {e}")
        return []

async def extract_keywords(text: str) -> List[str]:
    """Extract keywords using spaCy first, then Gemini as fallback"""
    # First try spaCy
    keywords = await extract_keywords_spacy(text)
    
    # If no keywords found, use Gemini
    if not keywords:
        keywords = await extract_keywords_gemini(text)
    
    return keywords[:5]  # Return maximum 5 keywords