import RPi.GPIO as GPIO
import time

# Set the GPIO modes
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# Set the GPIO Pin as output
servo_pin = 14
GPIO.setup(servo_pin, GPIO.OUT)

# Set PWM parameters
pwm_frequency = 50
pwm = GPIO.PWM(servo_pin, pwm_frequency)

# Start PWM
pwm.start(0)

def set_servo_angle(angle):
    # Convert the angle to duty cycle
    duty_cycle = (angle / 18) + 2
    pwm.ChangeDutyCycle(duty_cycle)
    time.sleep(0.5)
    pwm.ChangeDutyCycle(0)  # stop sending signal to avoid jitter

try:
    while True:
        angle = float(input("Enter angle (0 to 180): "))
        if 0 <= angle <= 180:
            set_servo_angle(angle)
        else:
            print("Angle must be between 0 and 180 degrees")
except KeyboardInterrupt:
    print("Program exited")
finally:
    pwm.stop()
    GPIO.cleanup()
