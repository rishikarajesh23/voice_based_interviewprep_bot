from gtts import gTTS
import speech_recognition as sr
import io
import base64
from typing import Optional

recognizer = sr.Recognizer()

async def text_to_speech(text: str, lang: str = 'en') -> str:
    """Convert text to speech and return base64 encoded audio"""
    try:
        tts = gTTS(text=text, lang=lang, slow=False)
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        
        # Encode to base64
        audio_base64 = base64.b64encode(audio_buffer.read()).decode('utf-8')
        return audio_base64
    except Exception as e:
        print(f"Error in TTS: {e}")
        return None

async def speech_to_text(audio_data: bytes) -> Optional[str]:
    """Convert speech to text"""
    try:
        # Convert audio bytes to AudioData
        audio_buffer = io.BytesIO(audio_data)
        with sr.AudioFile(audio_buffer) as source:
            audio = recognizer.record(source)
        
        # Use Google Speech Recognition
        text = recognizer.recognize_google(audio)
        return text
    except sr.UnknownValueError:
        print("Speech recognition could not understand audio")
        return None
    except sr.RequestError as e:
        print(f"Error with speech recognition service: {e}")
        return None
    except Exception as e:
        print(f"Error in STT: {e}")
        return None
