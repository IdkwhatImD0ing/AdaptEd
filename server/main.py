import logging
import os

# import voice
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from mongodb_manager import MongoDBManager

load_dotenv()


app = FastAPI()

# app.include_router(voice.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration for your MongoDB instance

mongo_client = MongoDBManager(os.getenv("MONGO_URI"), os.getenv("DB_NAME"))


@app.middleware("http")
async def log_request(request: Request, call_next):
    logging.info(f"Incoming request: {request.method} {request.url}")
    logging.info(f"Headers: {request.headers}")
    response = await call_next(request)
    logging.info(f"Response status: {response.status_code}")
    return response


@app.get("/lectures/")
async def get_lecture(email: str, title: str):
    """
    Endpoint to retrieve a specific lecture based on user email and lecture title.
    """
    lecture = mongo_client.get_lecture(email, title)
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    print(lecture)
    return lecture


@app.get("/templates")
async def get_template(template_id: int):
    """
    Endpoint to retrieve a slide template based on its ID.
    """
    template = mongo_client.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template
