import asyncio
import io
from gtts import gTTS
from pydub import AudioSegment
import os
import playsound

# Try to import OpenAI API client (if available)
try:
    from openai import OpenAI
    client = OpenAI()
    has_api = True
except Exception:
    has_api = False

# Local whisper (for fallback)
import whisper


async def test_tts_to_stt():
    text = "Hello, my name is PrepTalk. I am testing the voice system integration."
    print(f"🗣️ Original text to generate: {text}")

    try:
        # ---------- TEXT TO SPEECH ----------
        print("🎧 Generating speech using gTTS...")
        tts = gTTS(text=text, lang='en', slow=False)
        tts_filename = "tts_generated.mp3"
        tts.save(tts_filename)
        print(f"✅ TTS audio saved as {tts_filename}")

        # ---------- PLAY AUDIO ----------
        print("🔊 Playing the generated speech...")
        playsound.playsound(tts_filename)

        # ---------- CONVERT MP3 TO WAV ----------
        wav_filename = "tts_generated.wav"
        audio = AudioSegment.from_mp3(tts_filename)
        audio.export(wav_filename, format="wav")
        print(f"🔄 Converted MP3 → WAV as {wav_filename}")

        # ---------- SPEECH TO TEXT ----------
        transcribed_text = None

        if has_api:
            try:
                print("🧠 Trying OpenAI Whisper API...")
                with open(wav_filename, "rb") as audio_file:
                    transcription = client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file
                    )
                transcribed_text = transcription.text.strip()
            except Exception as api_error:
                print(f"⚠️ API error: {api_error}")
                print("💻 Falling back to local Whisper model...")

        if transcribed_text is None:
            model = whisper.load_model("base")  # you can use "tiny", "small", "medium", or "large"
            result = model.transcribe(wav_filename)
            transcribed_text = result["text"].strip()

        # ---------- RESULT ----------
        print("\n✅ TRANSCRIPTION RESULT:")
        print(f"   Whisper heard: {transcribed_text}")

        print("\n📊 COMPARISON:")
        print(f"   Original Text:   {text}")
        print(f"   Transcribed Text:{transcribed_text}")

    except Exception as e:
        print(f"❌ Error: {e}")

    finally:
        # Cleanup
        for file in ["tts_generated.mp3", "tts_generated.wav"]:
            if os.path.exists(file):
                os.remove(file)


async def main():
    await test_tts_to_stt()


if __name__ == "__main__":
    asyncio.run(main())
