import re
from pytube import YouTube
import os
import shutil
import cv2
from langchain_community.tools import YouTubeSearchTool
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()


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


def get_timestamp(filename):
    """Extract the timestamp from a file name based on a predefined format.

    Args:
        filename (str): Filename from which to extract the timestamp.

    Returns:
        int or None: Extracted timestamp if format is correct, otherwise None.
    """
    parts = filename.split("_frame")
    if len(parts) != 2:
        return None  # Filename format is incorrect
    return parts[1].split("_")[0]


def video_to_gemini(frame_directory: str):
    """Returns a list of timestamps and responses for the uploaded video frames for gemini"""
    # Retrieve and sort video frames from the directory
    files = os.listdir(frame_directory)
    files = sorted(files)
    files_to_upload = [File(os.path.join(frame_directory, file)) for file in files]

    full_video = True  # Flag to control whether to process all video files

    uploaded_files = []
    print(
        f"Uploading {len(files_to_upload) if full_video else 10} files. This might take a bit..."
    )

    # Upload selected video files to the server
    for file in files_to_upload if full_video else files_to_upload[40:50]:
        print(f"Uploading: {file.file_path}...")
        response = genai.upload_file(path=file.file_path)
        file.set_file_response(response)
        uploaded_files.append(file)

    print(f"Completed file uploads!\n\nUploaded: {len(uploaded_files)} files")

    return [attr for file in uploaded_files for attr in (file.timestamp, file.response)]


def audio_to_gemini(audio_file_path: str):
    """Returns a list of audio context for gemini"""
    return upload_file(audio_file_path)


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


def download_youtube_video(url, path):
    print(f"Downloading content from {url}...")
    yt = YouTube(url)

    # Sanitize the video title to create a valid filename
    if not os.path.exists(path):
        os.makedirs(path)

    # Download the video at 720p resolution
    video_filename = f"video.mp4"
    video_stream = yt.streams.filter(file_extension="mp4", res="720p").first()

    video_path = video_stream.download(output_path=path, filename=video_filename)
    print(f"Video downloaded to {video_path}")

    # Download the best audio stream and save it as an MP4 (which is what pytube does natively)
    audio_filename = f"audio.mp3"
    audio_stream = yt.streams.filter(only_audio=True).first()
    audio_path = audio_stream.download(output_path=path, filename=audio_filename)
    print(f"Audio downloaded to {audio_path}")

    return video_path, audio_path


def create_frame_output_dir(output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    else:
        shutil.rmtree(output_dir)
        os.makedirs(output_dir)


def extract_frame_from_video(video_file_path):
    print(
        f"Extracting {video_file_path} at 1 frame per second. This might take a bit..."
    )
    # get the name of the file from the path
    file_name = os.path.basename(video_file_path)
    file_name, file_extension = os.path.splitext(file_name)
    seconds_per_frame = 10

    frame_extraction_directory = f"content/frames/{file_name}"
    create_frame_output_dir(frame_extraction_directory)
    vidcap = cv2.VideoCapture(video_file_path)
    fps = vidcap.get(cv2.CAP_PROP_FPS)
    frame_count = 0
    count = 0
    while vidcap.isOpened():
        success, frame = vidcap.read()
        if not success:  # End of video
            break
        if count % (fps * seconds_per_frame) == 0:  # Extract a frame every second
            min = frame_count // 60
            sec = frame_count % 60
            time_string = f"{min:02d}_{sec:02d}"
            image_name = f"vid_frame{time_string}.jpg"
            output_filename = frame_extraction_directory + "/" + image_name
            cv2.imwrite(output_filename, frame)
            frame_count += 1
        count += 1
    vidcap.release()
    print(f"Completed video frame extraction!\n\nExtracted: {frame_count} frames")
    return frame_extraction_directory


def get_data(topic):
    tool = YouTubeSearchTool()
    link = tool.run(f"{topic},1")
    link = link[2:-2].split("', '")

    # Example video url
    url = link[0]
    save_path = "videos"

    # Download video and extract frames
    video_file_path, audio_file_path = download_youtube_video(url, save_path)
    frame_directory = extract_frame_from_video(video_file_path)

    # Get the audio and video contexts
    audio_context = audio_to_gemini(audio_file_path)
    video_context = video_to_gemini(frame_directory)

    return audio_context, video_context
