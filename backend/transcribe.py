import openai
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")


def transcribe(file_path):
    with open(file_path, "rb") as audio_file:
        transcript = openai.Audio.transcribe("whisper-1", audio_file)
    print(transcript["text"])


if __name__ == "__main__":
    file_path = sys.argv[1]
    transcribe(file_path)
