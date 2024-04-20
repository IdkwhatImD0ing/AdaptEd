from base64 import b64encode
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, Iterator, List
from urllib.request import urlretrieve

from pydub import AudioSegment


def download_file(url: str) -> Path:
    example_dirpath = Path(__file__).parent
    data_dirpath = example_dirpath / "data"
    data_dirpath.mkdir(exist_ok=True)
    filepath = data_dirpath / Path(url).name

    urlretrieve(url, filepath)
    return filepath


def generate_audio_stream(filepath: Path, chunk_size: int = 2000) -> Iterator[AudioSegment]:
    segment = AudioSegment.from_file(filepath)
    chunk_count = 0
    while True:
        start_time = chunk_count * chunk_size
        end_time = start_time + chunk_size
        if start_time > len(segment):
            return
        yield segment[start_time:end_time]
        chunk_count += 1


def encode_audio(segment: AudioSegment) -> str:
    bytes_io = BytesIO()
    segment.export(bytes_io, format="wav")
    return b64encode(bytes_io.read())


def print_emotions(emotions: List[Dict[str, Any]]) -> None:
    emotion_map = {e["name"]: e["score"] for e in emotions}
    # Print top 3 emotions
    for emotion, score in sorted(emotion_map.items(), key=lambda x: x[1], reverse=True)[:3]:
        print(f"{emotion}: {score:.2f}")