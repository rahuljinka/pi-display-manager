from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psutil
import time
import docker
import socket
import subprocess
import distro
import platform
import os
import shutil
from fastapi import UploadFile, File
from fastapi.responses import FileResponse


def format_uptime(seconds):

    seconds = int(seconds)
    days = seconds // 86400
    hours = (seconds % 86400) // 3600
    minutes = (seconds % 3600) // 60

    parts = []
    if days:
        parts.append(f"{days} day{'s' if days != 1 else ''}")
    if hours:
        parts.append(f"{hours} hour{'s' if hours != 1 else ''}")
    if minutes:
        parts.append(f"{minutes} minute{'s' if minutes != 1 else ''}")
    return " ".join(parts)

HOST_IP = "192.168.1.50"

app = FastAPI()
MEDIA_DIR = "/app/media"

os.makedirs(MEDIA_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

current_screen = {
    "screen": "dashboard"
}

current_media = {
    "file": None
}

class ScreenUpdate(BaseModel):
    screen: str

@app.get("/")
def root():
    return {
        "message": "Pi Display Backend"
    }

@app.get("/screen")
def get_screen():
    return current_screen

@app.post("/screen")
def update_screen(data: ScreenUpdate):
    current_screen["screen"] = data.screen
    return current_screen

@app.get("/stats")
def get_stats():
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    uptime_seconds = time.time() - psutil.boot_time()
    os_info = {
	"name": distro.name(),
	"version": distro.version(),
	"kernel": platform.release()
    }

    # Root disk
    root_disk = psutil.disk_usage("/")

    # Network
    network = psutil.net_io_counters()

    # Temperature
    try:
        with open("/sys/class/thermal/thermal_zone0/temp") as f:
            temperature = int(f.read()) / 1000
    except:
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
            "percent": root_disk.percent
        },

        "temperature": temperature,
        "uptime": format_uptime(uptime_seconds),
	"os": os_info,

        "network": {
            "sent": network.bytes_sent,
            "received": network.bytes_recv
        }
    }

@app.get("/containers")
def get_containers():
    client = docker.from_env()
    containers = client.containers.list()
    return [
        {
            "name": container.name,
            "status": container.status
        }
        for container in containers
    ]

@app.post("/media/upload")
def upload_media(file: UploadFile = File(...)):

    file_path = os.path.join(
        MEDIA_DIR,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    return {
        "message": "Uploaded successfully",
        "filename": file.filename
    }



@app.get("/media")
def list_media():

    media = []

    for filename in os.listdir(MEDIA_DIR):

        path = os.path.join(
            MEDIA_DIR,
            filename
        )

        if os.path.isfile(path):

            stat = os.stat(path)

            media.append({
                "filename": filename,
                "type": os.path.splitext(filename)[1].replace(".", "").upper(),
                "size": round(stat.st_size / (1024 * 1024), 2),
                "uploaded": time.strftime(
                    "%Y-%m-%d %H:%M:%S",
                    time.localtime(stat.st_mtime)
                )
            })


    return {
        "files": media
    }

@app.get("/media/current")
def get_current_media():
    return current_media


class MediaUpdate(BaseModel):
    file: str

@app.post("/media/current")
def set_current_media(data: MediaUpdate):
    current_media["file"] = data.file
    return current_media

@app.get("/media/{filename}")
def get_media(filename: str):

    file_path = os.path.join(
        MEDIA_DIR,
        filename
    )

    return FileResponse(file_path)



@app.delete("/media/{filename}")
def delete_media(filename: str):

    file_path = os.path.join(
        MEDIA_DIR,
        filename
    )

    if os.path.exists(file_path):
        os.remove(file_path)

    return {
        "message": "Deleted",
        "filename": filename
    }
