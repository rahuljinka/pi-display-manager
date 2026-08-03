from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psutil
import time

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
    disk = psutil.disk_usage("/")
    uptime = time.time() - psutil.boot_time()
    try:
        with open("/sys/class/thermal/thermal_zone0/temp") as f:
            temperature = int(f.read()) / 1000
    except:
        temperature = None
    return {
        "cpu": cpu,
        "ram_used": memory.used,
        "ram_total": memory.total,
        "ram_percent": memory.percent,
        "disk_percent": disk.percent,
        "temperature": temperature,
        "uptime_seconds": uptime
    }
