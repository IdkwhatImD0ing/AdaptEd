import google.generativeai as genai
import ast
import os
from constants import *
import random
# Load environment variables from a .env file
from dotenv import load_dotenv
load_dotenv()

# Parse API keys stored in an environment variable and convert them into a Python list
GEMINI_API_KEYS = os.environ.get("GEMINI_API_KEYS")
KEY_LIST = ast.literal_eval(GEMINI_API_KEYS)

# Shuffle the API keys list to ensure usage of different keys over time
random.shuffle(KEY_LIST)

# Initialize a global index to track the current API key being used
current_api_key_index = 0

def cycle_api_key():
    """Retrieve the next API key from the list, cycling back to the start if necessary."""
    global current_api_key_index
    if current_api_key_index >= len(KEY_LIST) - 1:
        current_api_key_index = 0
    else:
        current_api_key_index += 1
    return KEY_LIST[current_api_key_index]

def generate_new_model():
    """Generate and configure a new AI model instance with a cycled API key."""
    global current_api_key_index
    global messages
    api_key = cycle_api_key()  # Cycle to the next API key
    
    # Configure the generative AI model with the new API key
    genai.configure(api_key=api_key)
    
    # Initialize the model with specific configurations
    model = genai.GenerativeModel(
        "gemini-1.5-pro-latest",
        generation_config=genai.GenerationConfig(
            temperature=0,  # Set deterministic behavior for the model
        ),
    )
    return model

def upload_file(path):
    """Upload a file to the generative AI server and return the response.
    
    Args:
        path (str): The path to the file being uploaded.
    
    Returns:
        object: Server's response after file upload.
    """
    if path is None:
        return None
    return genai.upload_file(path=path)

class File:
    """A class to represent a file and its related metadata for processing."""
    def __init__(self, file_path: str, display_name: str = None):
        self.file_path = file_path
        self.display_name = display_name if display_name else file_path
        self.timestamp = get_timestamp(file_path)

    def set_file_response(self, response):
        """Associate a server response with the file.
        
        Args:
            response (object): The response received after uploading the file.
        """
        self.response = response

def get_timestamp(filename):
    """Extract the timestamp from a file name based on a predefined format.
    
    Args:
        filename (str): Filename from which to extract the timestamp.
    
    Returns:
        int or None: Extracted timestamp if format is correct, otherwise None.
    """
    parts = filename.split(FRAME_PREFIX)
    if len(parts) != 2:
        return None  # Filename format is incorrect
    return parts[1].split('_')[0]

def generate_content_audio(prompt, audio_file_path):
    """Generate content based on audio input and a specified prompt using an AI model.
    
    Args:
        prompt (str): Text prompt to guide content generation.
        audio_file_path (str): Path to the audio file used as input for generation.
    
    Returns:
        str: Generated text content based on the audio input.
    """
    model = generate_new_model()
    audio_file = upload_file(audio_file_path)
    if audio_file is None:
        response = model.generate_content([prompt], request_options={"timeout": 1000})
    else:
        response = model.generate_content([prompt, audio_file], request_options={"timeout": 1000})
    return response.text

def generate_content_video(prompt: str, frame_directory: str):
    """Generate content based on video frames and a specified prompt using an AI model.
    
    Args:
        prompt (str): Text prompt to guide content generation.
        frame_directory (str): Directory containing video frames for processing.
    
    Returns:
        str: Generated text content based on video frames.
    """
    model = generate_new_model()
    
    # Retrieve and sort video frames from the directory
    files = os.listdir(frame_directory)
    files = sorted(files)
    files_to_upload = [File(os.path.join(frame_directory, file)) for file in files]

    full_video = False  # Flag to control whether to process all video files

    uploaded_files = []
    print(f'Uploading {len(files_to_upload) if full_video else 10} files. This might take a bit...')

    # Upload selected video files to the server
    for file in files_to_upload if full_video else files_to_upload[40:50]:
        print(f'Uploading: {file.file_path}...')
        response = genai.upload_file(path=file.file_path)
        file.set_file_response(response)
        uploaded_files.append(file)

    print(f"Completed file uploads!\n\nUploaded: {len(uploaded_files)} files")

    # Prepare the request with video data and send it to the model for content generation
    request = [prompt] + [attr for file in uploaded_files for attr in (file.timestamp, file.response)]
    response = model.generate_content(request, request_options={"timeout": 600})
    return response.text

if __name__ == '__main__':
    # Main execution path for testing video and audio content generation
    video_frame_directory = 'experiments/content/frames/Never-Gonna-Give-You-Up'
    video_prompt = "Describe this video."
    response_to_video = generate_content_video(video_prompt, video_frame_directory)
    print("\n~Video Frame Analysis~\n")
    print(response_to_video)    
    
    audio_path = "experiments/content/videos/Never-Gonna-Give-You-Up.mp3"
    audio_prompt = "Listen carefully to the following audio file. Provide a brief summary."
    response_to_audio = generate_content_audio(audio_prompt, audio_path)
    print("\n~Audio Analysis~\n")
    print(response_to_audio)  
