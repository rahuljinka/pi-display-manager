from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

import psutil
import time
import docker
import socket
import platform
import os
import shutil
import requests

from hardware import (
    hardware_status,
    set_fan_speed,
    get_fan_speed,
    set_led_color,
    get_led_color,
    set_led_brightness,
    get_led_brightness,
    turn_led_off,
)


# ============================================================
# GENERAL HELPERS
# ============================================================

def format_uptime(seconds):
    seconds = int(seconds)

    days = seconds // 86400
    hours = (seconds % 86400) // 3600
    minutes = (seconds % 3600) // 60

    parts = []

    if days:
        parts.append(
            f"{days} day{'s' if days != 1 else ''}"
        )

    if hours:
        parts.append(
            f"{hours} hour{'s' if hours != 1 else ''}"
        )

    if minutes:
        parts.append(
            f"{minutes} minute{'s' if minutes != 1 else ''}"
        )

    return " ".join(parts)


# ============================================================
# CONFIGURATION
# ============================================================

HOST_IP = "192.168.1.50"

MEDIA_DIR = "/app/media"

os.makedirs(MEDIA_DIR, exist_ok=True)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="Pi Display Manager",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# STATE
# ============================================================

current_screen = {
    "screen": "dashboard"
}

current_media = {
    "file": None
}


# ============================================================
# PYDANTIC MODELS
# ============================================================

class ScreenUpdate(BaseModel):
    screen: str


class MediaUpdate(BaseModel):
    file: str


class FanSpeedUpdate(BaseModel):
    speed: float = Field(
        ge=0,
        le=100,
    )


class LEDColorUpdate(BaseModel):
    red: int = Field(
        ge=0,
        le=255,
    )

    green: int = Field(
        ge=0,
        le=255,
    )

    blue: int = Field(
        ge=0,
        le=255,
    )


class BrightnessUpdate(BaseModel):
    brightness: int = Field(
        ge=0,
        le=100,
    )


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Pi Display Backend"
    }


# ============================================================
# SCREEN
# ============================================================

@app.get("/screen")
def get_screen():
    return current_screen


@app.post("/screen")
def update_screen(data: ScreenUpdate):
    current_screen["screen"] = data.screen

    return current_screen


# ============================================================
# HARDWARE
# ============================================================

@app.get("/hardware")
def get_hardware():
    return hardware_status()


# ============================================================
# FAN
# ============================================================

@app.get("/hardware/fan")
def get_fan():
    status = hardware_status()

    return status["fan"]


@app.post("/hardware/fan")
def update_fan(data: FanSpeedUpdate):
    speed = set_fan_speed(data.speed)

    return {
        "success": True,
        "speed_percent": speed,
    }


@app.post("/hardware/fan/off")
def fan_off():
    speed = set_fan_speed(0)

    return {
        "success": True,
        "speed_percent": speed,
    }


# ============================================================
# LED
# ============================================================

@app.get("/hardware/led")
def get_led():
    status = hardware_status()

    return status["led"]


@app.post("/hardware/led")
def update_led(data: LEDColorUpdate):
    color = set_led_color(
        data.red,
        data.green,
        data.blue,
    )

    return {
        "success": True,
        "color": color,
        "brightness_percent": get_led_brightness(),
    }


# ============================================================
# LED BRIGHTNESS
# ============================================================

@app.get("/hardware/led/brightness")
def get_led_brightness_endpoint():
    return {
        "brightness_percent": get_led_brightness()
    }


@app.post("/hardware/led/brightness")
def update_led_brightness(data: BrightnessUpdate):
    brightness = set_led_brightness(
        data.brightness
    )

    return {
        "success": True,
        "brightness_percent": brightness,
        "color": get_led_color(),
    }


@app.post("/hardware/led/off")
def led_off():
    color = turn_led_off()

    return {
        "success": True,
        "color": color,
        "brightness_percent": get_led_brightness(),
    }


# ============================================================
# SYSTEM STATS
# ============================================================

@app.get("/stats")
def get_stats():
    cpu = psutil.cpu_percent(interval=1)

    memory = psutil.virtual_memory()

    uptime_seconds = (
        time.time() - psutil.boot_time()
    )

    os_info = {
        "name": __import__("distro").name(),
        "version": __import__("distro").version(),
        "kernel": platform.release(),
    }

    root_disk = psutil.disk_usage("/")

    network = psutil.net_io_counters()

    try:
        with open(
            "/sys/class/thermal/thermal_zone0/temp"
        ) as f:
            temperature = (
                int(f.read()) / 1000
            )

    except Exception:
        temperature = None

    return {
        "hostname": socket.gethostname(),

        "ip": HOST_IP,

        "cpu": cpu,

        "ram_used": memory.used,

        "ram_total": memory.total,

        "ram_percent": memory.percent,

        "storage": {
            "used": root_disk.used,
            "total": root_disk.total,
            "percent": root_disk.percent,
        },

        "temperature": temperature,

        "uptime": format_uptime(
            uptime_seconds
        ),

        "os": os_info,

        "network": {
            "sent": network.bytes_sent,
            "received": network.bytes_recv,
        },
    }


# ============================================================
# DOCKER CONTAINERS
# ============================================================

@app.get("/containers")
def get_containers():
    client = docker.from_env()

    containers = client.containers.list(
        all=True
    )

    result = []

    for container in containers:
        image_name = "unknown"

        if container.image.tags:
            image_name = (
                container.image.tags[0]
            )

        elif (
            "Config" in container.attrs
            and "Image" in container.attrs["Config"]
        ):
            image_name = (
                container.attrs["Config"]["Image"]
            )

        result.append(
            {
                "name": container.name,
                "image": image_name,
                "status": container.status,
            }
        )

    return result


# ============================================================
# MEDIA UPLOAD
# ============================================================

@app.post("/media/upload")
def upload_media(
    file: UploadFile = File(...)
):
    file_path = os.path.join(
        MEDIA_DIR,
        file.filename,
    )

    with open(
        file_path,
        "wb",
    ) as buffer:
        shutil.copyfileobj(
            file.file,
            buffer,
        )

    return {
        "message": "Uploaded successfully",
        "filename": file.filename,
    }


# ============================================================
# MEDIA LIST
# ============================================================

@app.get("/media")
def list_media():
    media = []

    for filename in os.listdir(
        MEDIA_DIR
    ):
        path = os.path.join(
            MEDIA_DIR,
            filename,
        )

        if os.path.isfile(path):
            stat = os.stat(path)

            media.append(
                {
                    "filename": filename,

                    "type": (
                        os.path.splitext(filename)[1]
                        .replace(".", "")
                        .upper()
                    ),

                    "size": round(
                        stat.st_size
                        / (1024 * 1024),
                        2,
                    ),

                    "uploaded": time.strftime(
                        "%Y-%m-%d %H:%M:%S",
                        time.localtime(
                            stat.st_mtime
                        ),
                    ),
                }
            )

    return {
        "files": media
    }


# ============================================================
# CURRENT MEDIA
# ============================================================

@app.get("/media/current")
def get_current_media():
    return current_media


@app.post("/media/current")
def set_current_media(
    data: MediaUpdate
):
    current_media["file"] = data.file

    return current_media


# ============================================================
# MEDIA FILE
# ============================================================

@app.get("/media/{filename}")
def get_media(filename: str):
    file_path = os.path.join(
        MEDIA_DIR,
        filename,
    )

    return FileResponse(
        file_path
    )


# ============================================================
# DELETE MEDIA
# ============================================================

@app.delete("/media/{filename}")
def delete_media(filename: str):
    file_path = os.path.join(
        MEDIA_DIR,
        filename,
    )

    if os.path.exists(file_path):
        os.remove(file_path)

    return {
        "message": "Deleted",
        "filename": filename,
    }


# ============================================================
# WEATHER
# ============================================================

@app.get("/weather")
def get_weather():
    latitude = 40.5743
    longitude = -74.5361

    url = (
        "https://api.open-meteo.com/v1/forecast?"
        f"latitude={latitude}"
        f"&longitude={longitude}"
        "&current_weather=true"
        "&daily="
        "temperature_2m_max,"
        "temperature_2m_min,"
        "weathercode,"
        "precipitation_probability_max"
        "&temperature_unit=fahrenheit"
        "&timezone=America/New_York"
    )

    try:
        response = requests.get(
            url,
            timeout=10,
        )

        response.raise_for_status()

        data = response.json()

        forecast = []

        for i in range(
            len(data["daily"]["time"])
        ):
            forecast.append(
                {
                    "date": data["daily"]["time"][i],

                    "high": (
                        data["daily"]
                        ["temperature_2m_max"][i]
                    ),

                    "low": (
                        data["daily"]
                        ["temperature_2m_min"][i]
                    ),

                    "code": (
                        data["daily"]
                        ["weathercode"][i]
                    ),

                    "rain_chance": (
                        data["daily"]
                        ["precipitation_probability_max"][i]
                    ),
                }
            )

        return {
            "location": "Somerset, NJ",

            "current": (
                data["current_weather"]
            ),

            "forecast": forecast,
        }

    except Exception as e:
        return {
            "error": str(e)
        }
