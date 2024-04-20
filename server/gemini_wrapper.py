import google.generativeai as genai
import ast
import os
from constants import *
import random
# Load environment variables
from dotenv import load_dotenv

load_dotenv()

# Convert the GEMINI_API_KEYS string from environment variables to a list
GEMINI_API_KEYS = os.environ.get("GEMINI_API_KEYS")
KEY_LIST = ast.literal_eval(GEMINI_API_KEYS)

# Randomly shuffle the list of API keys
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

def generate_new_model():
    global current_api_key_index
    global messages
    # Get the current API key and cycle to the next one for future requests
    api_key = cycle_api_key()
    
    # Configure the generative AI model with the new API key
    genai.configure(api_key=api_key)
    
    model = genai.GenerativeModel(
        "gemini-1.5-pro-latest",
        generation_config=genai.GenerationConfig(
            # max_output_tokens=8000,
            temperature=0,
        ),
    )
    return model

def upload_file(path):
    if path is None:
        return None
    return genai.upload_file(path=path)

class File:
  def __init__(self, file_path: str, display_name: str = None):
    self.file_path = file_path
    if display_name:
      self.display_name = display_name
    self.timestamp = get_timestamp(file_path)

  def set_file_response(self, response):
    self.response = response

def get_timestamp(filename):
  """Extracts the frame count (as an integer) from a filename with the format
     'output_file_prefix_frame00_00.jpg'.
  """
  parts = filename.split(FRAME_PREFIX)
  if len(parts) != 2:
      return None  # Indicates the filename might be incorrectly formatted
  return parts[1].split('_')[0]

def generate_content_audio(prompt, audio_file_path):
    model = generate_new_model()
    audio_file = upload_file(audio_file_path)
    if audio_file is None:
        response = model.generate_content(
            [prompt], request_options={"timeout": 1000}
        )
    else:
        response = model.generate_content(
            [prompt, audio_file], request_options={"timeout": 1000}
        )
    return response.text

def generate_content_video(prompt: str, frame_directory: str):
    
    model = generate_new_model()
    
    files = os.listdir(frame_directory)
    files = sorted(files)
    files_to_upload = []    
    for file in files:
        files_to_upload.append(
            File(file_path=os.path.join(frame_directory, file)))

    full_video = False

    uploaded_files = []
    print(f'Uploading {len(files_to_upload) if full_video else 10} files. This might take a bit...')

    for file in files_to_upload if full_video else files_to_upload[40:50]:
        print(f'Uploading: {file.file_path}...')
        response = genai.upload_file(path=file.file_path)
        file.set_file_response(response)
        uploaded_files.append(file)

    print(f"Completed file uploads!\n\nUploaded: {len(uploaded_files)} files")

    # # List files uploaded in the API
    # for n, f in zip(range(len(uploaded_files)), genai.list_files()):
    #     print(f.uri)
    
    # Make GenerateContent request with the structure described above.
    request = [prompt]
    for file in uploaded_files:
        request.append(file.timestamp)
        request.append(file.response)

    response = model.generate_content(request,
                                    request_options={"timeout": 600})
    return response.text


if __name__ == '__main__':
    # Upload a file to the GEMINI API    
    
    video_frame_directory = 'experiments/content/frames/Never-Gonna-Give-You-Up'
    video_prompt = "Describe this video."
    response_to_video = generate_content_video(video_prompt, video_frame_directory)
    print("\n~Video Frame Analysis~\n")
    print(response_to_video)    
    
    audio_path = "experiments/content/videos/Never-Gonna-Give-You-Up.mp3"
    audio_prompt = "Listen carefully to the following audio file. Provide a brief summary."
    response_to_audio = generate_content_audio(audio_prompt, audio_path)
    print("\~Audio Analysis~\n")
    print(response_to_audio)    
    