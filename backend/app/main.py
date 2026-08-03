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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

current_screen = {
    "screen": "dashboard"
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
