from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


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
