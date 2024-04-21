import cv2
import os
import shutil
from pytube import YouTube
from constants import *
import re

def sanitize_filename(title):
    """Sanitize the string to be safe for filenames."""
    # Remove any character that is not alphanumeric, a space, underscore, or hyphen
    sanitized = re.sub(r'[^\w\s-]', '', title)
    # Replace spaces or multiple hyphens with a single hyphen
    sanitized = re.sub(r'\s+', '-', sanitized).strip('-_')
    return sanitized


def download_youtube_video(url, path):
    print(f"Downloading content from {url}...")
    yt = YouTube(url)

    # Sanitize the video title to create a valid filename
    base_filename = sanitize_filename(yt.title)

    if not os.path.exists(path):
        os.makedirs(path)

    # Download the video at 720p resolution
    video_filename = f"{base_filename}.mp4"
    video_stream = yt.streams.filter(file_extension='mp4', res="720p").first()

    video_path = video_stream.download(output_path=path, filename=video_filename)
    print(f"Video downloaded to {video_path}")

    # Download the best audio stream and save it as an MP4 (which is what pytube does natively)
    audio_filename = f"{base_filename}.mp3"
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
    print(f"Extracting {video_file_path} at 1 frame per second. This might take a bit...")
    #get the name of the file from the path
    file_name = os.path.basename(video_file_path)
    file_name, file_extension = os.path.splitext(file_name)
    
    frame_extraction_directory = f"experiments/content/frames/{file_name}"
    create_frame_output_dir(frame_extraction_directory)
    vidcap = cv2.VideoCapture(video_file_path)
    fps = vidcap.get(cv2.CAP_PROP_FPS)
    frame_duration = 1 / fps  # Time interval between frames (in seconds)
    frame_count = 0
    count = 0
    while vidcap.isOpened():
        success, frame = vidcap.read()
        if not success:  # End of video
            break
        if int(count / fps) == frame_count:  # Extract a frame every second
            min = frame_count // 60
            sec = frame_count % 60
            time_string = f"{min:02d}_{sec:02d}"
            image_name = f"{VIDEO_FILENAME.replace('.', '_')}{FRAME_PREFIX}{time_string}.jpg"
            output_filename = frame_extraction_directory + "/" + image_name
            # output_filename.replace("\"", "/")
            cv2.imwrite(output_filename, frame)
            # print("writing to " + output_filename)
            frame_count += 1
        count += 1
    vidcap.release()
    print(f"Completed video frame extraction!\n\nExtracted: {frame_count} frames")

def get_video(url: str):
    # Download video
    video_file_path, audio_file_path = download_youtube_video(url, "experiments/content/videos")
    # Extract frames
    extract_frame_from_video(video_file_path)
    return video_file_path, audio_file_path

if __name__ == "__main__":
    video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    get_video(video_url)
