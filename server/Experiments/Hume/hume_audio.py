import multiprocessing
import cv2
import random
import time
import asyncio
from hume import HumeStreamClient
from hume.models.config import ProsodyConfig
from dotenv import load_dotenv
import os
import base64
import pyaudio
from utilities import encode_audio
from pydub import AudioSegment

load_dotenv()


async def process_audio(audio):
    client = HumeStreamClient(os.getenv("HUME_API_KEY"))
    config = ProsodyConfig()
    async with client.connect([config]) as socket:
        while True:
            # print queue length
            if audio is None:
                break

            result = await socket.send_bytes(audio)
            predictions = result.get("prosody", {}).get("predictions", [])
            if predictions:
                prediction = predictions[0]
                emotions = sorted(
                    prediction["emotions"],
                    key=lambda e: e["score"],
                    reverse=True,
                )[:3]
                for i, emotion in enumerate(emotions):
                    print(
                        f"Emotion {i + 1}: {emotion['name']} ({emotion['score']:.2%})",
                        flush=True,
                    )
                print("\n\n\n", flush=True)
                return emotions


def update_data(audio_queue, lock, last_emotions):
    while True:
        audio = audio_queue.get()  # Receive audio from the queue
        if audio is None:  # We can use None as a signal to stop the process
            break

        # Run the asynchronous audio processing function
        emotions = asyncio.run(process_audio(audio))

        # Update shared variables with the results
        with lock:
            last_emotions[:] = emotions


# Set up PyAudio
CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
RECORD_SECONDS = 5
FRAMES_PER_RECORD = int(RATE / CHUNK * RECORD_SECONDS)


def capture_and_print(audio_queue, lock, last_emotions):
    p = pyaudio.PyAudio()
    stream = p.open(
        format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK
    )
    print("* recording")
    try:
        while True:
            frames = []
            for _ in range(FRAMES_PER_RECORD):
                data = stream.read(CHUNK)
                frames.append(data)
            audio_data = b"".join(frames)
            segment = AudioSegment(
                data=audio_data,
                sample_width=p.get_sample_size(FORMAT),
                frame_rate=RATE,
                channels=CHANNELS,
            )
            audio_base64 = encode_audio(segment)
            audio_queue.put(audio_base64)
    finally:
        audio_queue.put(None)  # Signal to the processing loop to stop
        stream.stop_stream()
        stream.close()
        p.terminate()


if __name__ == "__main__":
    lock = multiprocessing.Lock()
    audio_queue = multiprocessing.Queue(
        maxsize=10
    )  # Limit the queue size to prevent excessive memory usage
    manager = multiprocessing.Manager()
    last_emotions = manager.list()

    # Creating processes
    update_process = multiprocessing.Process(
        target=update_data,
        args=(audio_queue, lock, last_emotions),
    )
    capture_process = multiprocessing.Process(
        target=capture_and_print,
        args=(audio_queue, lock, last_emotions),
    )

    update_process.start()
    capture_process.start()

    update_process.join()
    capture_process.join()
