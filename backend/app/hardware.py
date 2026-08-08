"""
Hardware control for the Pi Display Manager.

Fan:
    GPIO 18
    Physical pin 12
    Linux PWM chip 0, channel 2
    25 kHz PWM

WS2812:
    GPIO 10
    Physical pin 19
    SPI0.0
    1 LED

Brightness:
    Software-controlled RGB scaling.
    The requested RGB color is preserved internally and
    brightness is applied when the LED is written.
"""

import os
from typing import Dict

from rpi5_ws2812.ws2812 import Color, Strip, WS2812SpiDriver


# ============================================================
# FAN / PWM CONFIGURATION
# ============================================================

PWM_CHIP = "/sys/class/pwm/pwmchip0"
PWM_CHANNEL = 2

FAN_GPIO = 18
FAN_PHYSICAL_PIN = 12
FAN_FREQUENCY_HZ = 25_000

PWM_PATH = f"{PWM_CHIP}/pwm{PWM_CHANNEL}"


# ============================================================
# WS2812 CONFIGURATION
# ============================================================

LED_GPIO = 10
LED_PHYSICAL_PIN = 19

SPI_BUS = 0
SPI_DEVICE = 0

LED_COUNT = 1


# ============================================================
# INTERNAL STATE
# ============================================================

_current_fan_speed = 0.0

# The user's requested/original RGB color.
_current_led_color = (0, 0, 0)

# LED brightness, 0-100%.
_current_led_brightness = 100.0

_led_strip = None


# ============================================================
# PWM HELPERS
# ============================================================

def _write_pwm_file(filename: str, value: str) -> None:
    """Write a value to a Linux PWM sysfs file."""
    with open(os.path.join(PWM_PATH, filename), "w") as file:
        file.write(str(value))


def _ensure_pwm_exported() -> None:
    """Export PWM channel if necessary."""
    if not os.path.exists(PWM_PATH):
        with open(os.path.join(PWM_CHIP, "export"), "w") as file:
            file.write(str(PWM_CHANNEL))


def _configure_pwm() -> None:
    """
    Configure PWM channel 2 for 25 kHz.

    25 kHz = 40,000 ns period.
    """
    _ensure_pwm_exported()

    period_ns = int(1_000_000_000 / FAN_FREQUENCY_HZ)

    try:
        _write_pwm_file("enable", "0")
    except Exception:
        pass

    _write_pwm_file("period", str(period_ns))
    _write_pwm_file("duty_cycle", "0")


# ============================================================
# FAN CONTROL
# ============================================================

def set_fan_speed(percent: float) -> float:
    """
    Set fan speed from 0-100%.
    """
    global _current_fan_speed

    percent = max(0.0, min(100.0, float(percent)))

    _configure_pwm()

    period_ns = int(1_000_000_000 / FAN_FREQUENCY_HZ)
    duty_ns = int(period_ns * (percent / 100.0))

    _write_pwm_file("duty_cycle", str(duty_ns))

    if percent > 0:
        _write_pwm_file("enable", "1")
    else:
        _write_pwm_file("enable", "0")

    _current_fan_speed = percent

    return percent


def get_fan_speed() -> float:
    """Return current fan speed."""
    return _current_fan_speed


def stop_fan() -> None:
    """Stop the fan."""
    set_fan_speed(0)


# ============================================================
# WS2812 CONTROL
# ============================================================

def _get_led_strip() -> Strip:
    """
    Lazily initialize the WS2812 strip.

    Uses:
        SPI0.0
        GPIO10
        Physical pin 19
    """
    global _led_strip

    if _led_strip is None:
        driver = WS2812SpiDriver(
            SPI_BUS,
            SPI_DEVICE,
            LED_COUNT,
        )

        _led_strip = Strip(driver)

    return _led_strip


def _apply_led_output() -> Dict[str, int]:
    """
    Write the currently selected color to the WS2812,
    applying the current brightness.

    The original color is preserved in _current_led_color.
    """
    red, green, blue = _current_led_color

    brightness = _current_led_brightness / 100.0

    output_red = round(red * brightness)
    output_green = round(green * brightness)
    output_blue = round(blue * brightness)

    strip = _get_led_strip()

    strip.set_all_pixels(
        Color(
            output_red,
            output_green,
            output_blue,
        )
    )

    strip.show()

    return {
        "red": output_red,
        "green": output_green,
        "blue": output_blue,
    }


def set_led_color(
    red: int,
    green: int,
    blue: int,
) -> Dict[str, int]:
    """
    Set the WS2812's requested RGB color.

    RGB values range from 0-255.

    Brightness is applied separately, so changing brightness
    will not destroy the selected color.
    """
    global _current_led_color

    red = max(0, min(255, int(red)))
    green = max(0, min(255, int(green)))
    blue = max(0, min(255, int(blue)))

    _current_led_color = (red, green, blue)

    _apply_led_output()

    return {
        "red": red,
        "green": green,
        "blue": blue,
    }


def get_led_color() -> Dict[str, int]:
    """Return the currently selected RGB color."""
    red, green, blue = _current_led_color

    return {
        "red": red,
        "green": green,
        "blue": blue,
    }


# ============================================================
# LED BRIGHTNESS
# ============================================================

def set_led_brightness(brightness: float) -> float:
    """
    Set LED brightness from 0-100%.

    The selected RGB color is preserved.
    """
    global _current_led_brightness

    brightness = max(0.0, min(100.0, float(brightness)))

    _current_led_brightness = brightness

    _apply_led_output()

    return brightness


def get_led_brightness() -> float:
    """Return current LED brightness."""
    return _current_led_brightness


def turn_led_off() -> None:
    """Turn the LED off without changing the selected color."""
    global _current_led_brightness

    _current_led_brightness = 0.0

    _apply_led_output()


# ============================================================
# COMBINED CONTROL
# ============================================================

def set_fan_and_led(
    fan_speed: float,
    red: int,
    green: int,
    blue: int,
) -> Dict:
    """Set fan speed and LED color together."""

    speed = set_fan_speed(fan_speed)

    color = set_led_color(
        red,
        green,
        blue,
    )

    return {
        "fan": {
            "speed_percent": speed,
        },
        "led": {
            "color": color,
            "brightness": get_led_brightness(),
        },
    }


# ============================================================
# STATUS
# ============================================================

def hardware_status() -> Dict:
    """Return hardware configuration and current state."""

    return {
        "fan": {
            "available": os.path.exists(PWM_CHIP),
            "pwm_chip": PWM_CHIP,
            "pwm_channel": PWM_CHANNEL,
            "gpio": FAN_GPIO,
            "physical_pin": FAN_PHYSICAL_PIN,
            "frequency_hz": FAN_FREQUENCY_HZ,
            "speed_percent": get_fan_speed(),
        },
        "led": {
            "available": os.path.exists("/dev/spidev0.0"),
            "type": "WS2812",
            "gpio": LED_GPIO,
            "physical_pin": LED_PHYSICAL_PIN,
            "spi_bus": SPI_BUS,
            "spi_device": SPI_DEVICE,
            "led_count": LED_COUNT,
            "color": get_led_color(),
            "brightness": get_led_brightness(),
        },
    }
