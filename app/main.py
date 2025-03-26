# Main file that runs the FastAPI application.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .routers import auth, expenses
from .database import engine
from . import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["expenses"])


@app.get("/")
async def read_root():
    return FileResponse("templates/index.html")
