import cv2
import os
import shutil
from pytube import YouTube

# YouTube video URL
VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

# Directory to save the downloaded video
DOWNLOAD_DIRECTORY = "experiments/content/videos"
VIDEO_FILENAME = "downloaded_video.mp4"

# Directory for extracted frames
FRAME_EXTRACTION_DIRECTORY = "experiments/content/frames"
FRAME_PREFIX = "_frame"

def download_youtube_video(url, path):
    print(f"Downloading video from {url}...")
    yt = YouTube(url)
    stream = yt.streams.filter(file_extension='mp4').get_highest_resolution()
    if not os.path.exists(path):
        os.makedirs(path)
    video_path = stream.download(output_path=path, filename=VIDEO_FILENAME)
    print(f"Video downloaded to {video_path}")
    return video_path

def create_frame_output_dir(output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    else:
        shutil.rmtree(output_dir)
        os.makedirs(output_dir)

def extract_frame_from_video(video_file_path):
    print(f"Extracting {video_file_path} at 1 frame per second. This might take a bit...")
    create_frame_output_dir(FRAME_EXTRACTION_DIRECTORY)
    vidcap = cv2.VideoCapture(video_file_path)
    fps = vidcap.get(cv2.CAP_PROP_FPS)
    frame_duration = 1 / fps  # Time interval between frames (in seconds)
    frame_count = 0
    count = 0
    while vidcap.isOpened():
        success, frame = vidcap.read()
        if not success:  # End of video
            break
        if frame_count > 200:
            print(frame)
        if int(count / fps) == frame_count:  # Extract a frame every second
            min = frame_count // 60
            sec = frame_count % 60
            time_string = f"{min:02d}_{sec:02d}"
            image_name = f"{VIDEO_FILENAME.replace('.', '_')}{FRAME_PREFIX}{time_string}.jpg"
            output_filename = FRAME_EXTRACTION_DIRECTORY + "/" + image_name
            # output_filename.replace("\"", "/")
            cv2.imwrite(output_filename, frame)
            print("writing to " + output_filename)
            frame_count += 1
        count += 1
    vidcap.release()
    print(f"Completed video frame extraction!\n\nExtracted: {frame_count} frames")

def main():
    # Download video
    video_file_path = download_youtube_video(VIDEO_URL, DOWNLOAD_DIRECTORY)
    # Extract frames
    extract_frame_from_video(video_file_path)

if __name__ == "__main__":
    main()
