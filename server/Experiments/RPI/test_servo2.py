    from gpiozero import Servo
    import time

    mouth_servo1 = Servo(12)
    mouth_servo2 = Servo(16)
    delay = 0.5

    while True:
        mouth_servo1.max()
        mouth_servo2.max()
        time.sleep(delay)
        mouth_servo1.min()
        mouth_servo2.max()
        time.sleep(delay)
        
    mouth_servo1.value = None
    mouth_servo2.value = None
