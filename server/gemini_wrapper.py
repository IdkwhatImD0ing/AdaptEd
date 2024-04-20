import google.generativeai as genai
import ast
import os

# Load environment variables
from dotenv import load_dotenv

load_dotenv()

# Convert the GEMINI_API_KEYS string from environment variables to a list
GEMINI_API_KEYS = os.environ.get("GEMINI_API_KEYS")
KEY_LIST = ast.literal_eval(GEMINI_API_KEYS)

# Randomly shuffle the list of API keys
import random

random.shuffle(KEY_LIST)

# Global index to keep track of the current key
current_api_key_index = 0

# remember the previous messages
messages = []


def cycle_api_key():
    global current_api_key_index
    if current_api_key_index >= len(KEY_LIST) - 1:
        current_api_key_index = 0
    else:
        current_api_key_index += 1
    return KEY_LIST[current_api_key_index]


def generate_content_with_cycling_keys(prompt, audio_file_path = None, image=None):
    global current_api_key_index
    global messages
    # Get the current API key and cycle to the next one for future requests
    api_key = cycle_api_key()
    
    # Configure the generative AI model with the new API key
    genai.configure(api_key=api_key)
    audio_file = genai.upload_file(path=audio_file_path)
    model = genai.GenerativeModel(
        "gemini-1.5-pro-latest",
        generation_config=genai.GenerationConfig(
            # max_output_tokens=8000,
            temperature=0,
        ),
    )

    # utilize memory
    # if system_prompt == system_prompt_generate:
    #     local_memory = []
    # else:
    #     local_memory = messages
    local_memory = []

    # Generate content using the provided prompt
    if audio_file is None:
        response = model.generate_content(
            local_memory + [prompt], request_options={"timeout": 1000}
        )
    else:
        response = model.generate_content(
            local_memory + [prompt, audio_file], request_options={"timeout": 1000}
        )
    return response.text

if __name__ == '__main__':
    # Upload a file to the GEMINI API
    
    path = "./experiments/content/videos/downloaded_audio.mp3"
    response = generate_content_with_cycling_keys("Listen carefully to the following audio file. Provide a brief summary.", audio_file_path=path)
    print(response)