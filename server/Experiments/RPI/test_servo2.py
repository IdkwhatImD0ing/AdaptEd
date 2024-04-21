import time

import cv2
from gpiozero import Servo

# Initialize the camera
# 0 is usually the default value for a single camera setup
camera = cv2.VideoCapture(0)

# Setup for the servos
mouth_servo1 = Servo(12)
mouth_servo2 = Servo(16)

delay = 0.5

try:
    while True:
        # Read a single frame from the camera
        ret, frame = camera.read()
        if not ret:
            print("Failed to grab frame")
            break

        # Display the frame using OpenCV
        cv2.imshow("Camera", frame)
        cv2.waitKey(1)  # Wait for 1 ms before moving on in the loop

        # Uncomment and use the following servo control as needed
        # mouth_servo1.max()
        # mouth_servo2.max()
        # time.sleep(delay)
        # mouth_servo1.mid()
        # mouth_servo2.mid()
        # time.sleep(delay)

        time.sleep(delay)

finally:
    # Cleanup
    mouth_servo1.value = None
    mouth_servo2.value = None
    camera.release()
    cv2.destroyAllWindows()
