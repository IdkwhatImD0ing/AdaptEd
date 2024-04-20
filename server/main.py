from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging

import voice

app = FastAPI()

app.include_router(voice.router)


@app.middleware("http")
async def log_request(request: Request, call_next):
    logging.info(f"Incoming request: {request.method} {request.url}")
    logging.info(f"Headers: {request.headers}")
    response = await call_next(request)
    logging.info(f"Response status: {response.status_code}")
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
