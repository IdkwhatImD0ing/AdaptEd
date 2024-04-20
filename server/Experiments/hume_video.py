import cv2
import time
import asyncio
from hume import HumeStreamClient
from hume.models.config import FaceConfig
from dotenv import load_dotenv
import os

load_dotenv()

async def capture_and_send():
    # Initialize the camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Cannot open camera")
        return

    # Initial time to manage frame rate
    prev_time = 0
    interval = 2  # Time interval in seconds
    last_bbox = None
    last_prob = None
    last_emotions = []

    try:
        client = HumeStreamClient(os.getenv("HUME_API_KEY"))
        config = FaceConfig()

        async with client.connect([config]) as socket:
            while True:
                ret, frame = cap.read()
                if not ret:
                    print("Failed to grab frame")
                    break

                # Only process frame every 2 seconds
                if time.time() - prev_time > interval:
                    prev_time = time.time()
                    frame_path = 'capture.jpg'
                    cv2.imwrite(frame_path, frame)

                    result = await socket.send_file(frame_path)
                    predictions = result.get("face", {}).get("predictions", [])

                    if predictions:
                        prediction = predictions[0]
                        last_bbox = prediction["bbox"]
                        last_prob = prediction["prob"]
                        last_emotions = sorted(prediction["emotions"], key=lambda e: e['score'], reverse=True)[:3]

                # Draw annotations if available
                if last_bbox:
                    x, y, w, h = int(last_bbox['x']), int(last_bbox['y']), int(last_bbox['w']), int(last_bbox['h'])
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                    cv2.putText(frame, f'Prob: {last_prob:.2f}', (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

                if last_emotions:
                    for i, emotion in enumerate(last_emotions):
                        text = f"{emotion['name']}: {emotion['score']:.2f}"
                        cv2.putText(frame, text, (10, 30 * (i + 1)), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)

                # Show the frame
                cv2.imshow('Video Stream', frame)
                
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

    finally:
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    asyncio.run(capture_and_send())
