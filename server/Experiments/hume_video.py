import multiprocessing
import cv2
import random
import time
import asyncio
from hume import HumeStreamClient
from hume.models.config import FaceConfig
from dotenv import load_dotenv
import os
import base64

load_dotenv()


async def process_frame(frame):
    client = HumeStreamClient(os.getenv("HUME_API_KEY"))
    config = FaceConfig()
    async with client.connect([config]) as socket:
        frame_base64 = base64.b64encode(cv2.imencode(".jpg", frame)[1]).decode()

        result = await socket.send_bytes(frame_base64.encode())
        predictions = result.get("face", {}).get("predictions", [])

        if predictions:
            prediction = predictions[0]
            last_bbox = prediction["bbox"]
            last_prob = prediction["prob"]
            last_emotions = sorted(
                prediction["emotions"],
                key=lambda e: e["score"],
                reverse=True,
            )[:3]

            return last_bbox, last_prob, last_emotions
        return {"x": 0, "y": 0, "w": 0, "h": 0}, 0.0, []


def update_data(frame_queue, lock, last_bbox, last_prob, last_emotions):
    while True:
        frame = frame_queue.get()  # Receive frame from the queue
        if frame is None:  # We can use None as a signal to stop the process
            break

        # Run the asynchronous frame processing function
        bbox, prob, emotions = asyncio.run(process_frame(frame))

        # Update shared variables with the results
        with lock:
            if bbox:
                last_bbox["x"] = bbox["x"]
                last_bbox["y"] = bbox["y"]
                last_bbox["w"] = bbox["w"]
                last_bbox["h"] = bbox["h"]
            last_prob.value = prob
            last_emotions[:] = emotions

        print(
            f"Updated bbox: {last_bbox}, prob: {last_prob.value}, emotions: {last_emotions}"
        )


def capture_and_display(frame_queue, lock, last_bbox, last_prob, last_emotions):
    cap = cv2.VideoCapture(0)
    prev_time = 0
    interval = 2
    if not cap.isOpened():
        print("Cannot open camera")
        return

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Can't receive frame (stream end?). Exiting ...")
                break
            if time.time() - prev_time > interval:
                prev_time = time.time()
                frame_queue.put(frame)  # Send frame to the queue

            # Display the frame with annotations
            with lock:
                if last_bbox:
                    x, y, w, h = (
                        int(last_bbox["x"]),
                        int(last_bbox["y"]),
                        int(last_bbox["w"]),
                        int(last_bbox["h"]),
                    )
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                    cv2.putText(
                        frame,
                        f"Prob: {last_prob.value:.2f}",
                        (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.9,
                        (0, 255, 0),
                        2,
                    )

                if last_emotions:
                    for i, emotion in enumerate(last_emotions):
                        text = f"{emotion['name']}: {emotion['score']:.2f}"
                        cv2.putText(
                            frame,
                            text,
                            (10, 30 * (i + 1)),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.9,
                            (255, 255, 255),
                            2,
                        )

            cv2.imshow("Video Stream", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    finally:
        frame_queue.put(None)  # Signal to the update_data process to stop
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    lock = multiprocessing.Lock()
    frame_queue = multiprocessing.Queue(
        maxsize=10
    )  # Limit the queue size to prevent excessive memory usage
    manager = multiprocessing.Manager()
    last_bbox = manager.dict(x=0, y=0, w=0, h=0)
    last_prob = multiprocessing.Value("d", 0.0)
    last_emotions = manager.list()

    # Creating processes
    update_process = multiprocessing.Process(
        target=update_data,
        args=(frame_queue, lock, last_bbox, last_prob, last_emotions),
    )
    capture_process = multiprocessing.Process(
        target=capture_and_display,
        args=(frame_queue, lock, last_bbox, last_prob, last_emotions),
    )

    update_process.start()
    capture_process.start()

    update_process.join()
    capture_process.join()
