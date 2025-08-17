from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
import uvicorn
import os
import shutil
from typing import List, Dict
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import custom modules
from ocr import extract_text_from_image
from nlp_processing import summarize_document, highlight_key_points, enhance_summary

# --- FastAPI App Setup ---
app = FastAPI(
    title="Legal Awareness App Backend",
    description="API for processing legal documents: OCR, Summarization, and Key Point Highlighting."
)

# Configure CORS to allow frontend to connect
# Get allowed origins from environment or use defaults
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:8081,http://10.0.2.2:8081,exp://localhost:8081').split(',')
origins = [
    "http://localhost",
    "http://localhost:3000",  # React development server
    "http://localhost:8081",  # Expo development server
    "exp://localhost:8081",   # Expo Go app
    "http://10.0.2.2:8000",   # Android emulator to host
    "http://10.0.2.2:8081",   # Android emulator to Expo
] + allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.get("/health")
async def health_check():
    """Health check endpoint to verify backend is running."""
    return {
        "status": "healthy",
        "message": "Legal Awareness App Backend is running",
        "llm_available": bool(os.getenv('GEMINI_API_KEY')),
        "version": "2.0.0"
    }

@app.post("/process_document")
async def process_document_endpoint(
    file: UploadFile,
):
    """
    Processes an uploaded legal document:
    1. Extracts text using OCR.
    2. Summarizes the English text.
    3. Extracts and highlights crucial points in English.
    """
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp')):
        raise HTTPException(status_code=400, detail="Only image files (PNG, JPG, JPEG, TIFF, BMP) are supported for OCR.")

    if file.size > 5 * 1024 * 1024: # 5MB limit
        raise HTTPException(status_code=400, detail="File too large. Maximum 5MB allowed.")

    # Save the uploaded file temporarily
    file_location = f"temp_{file.filename}"
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1. OCR
        extracted_text = ""
        try:
            extracted_text = extract_text_from_image(file_location)
            if not extracted_text.strip():
                raise ValueError("OCR_FAILED: Could not extract text from the image. Please try a clearer photo.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OCR processing failed: {e}")

        # 2. Summarization (English)
        summary_en = ""
        try:
            summary_en = summarize_document(extracted_text)
            # Enhance summary with legal keywords for visual emphasis in frontend
            enhanced_summary_en = enhance_summary(summary_en)
        except Exception as e:
            # Fallback to first N words if summarization fails
            summary_en = " ".join(extracted_text.split()[:150]) + "..."
            enhanced_summary_en = summary_en # No enhancement if main summary failed
            print(f"Summarization failed, using fallback: {e}")


        # 3. Crucial Points Highlighting (English)
        key_points_structured: List[Dict] = []
        try:
            key_points_structured = highlight_key_points(extracted_text)
            # Send list of strings to frontend for simplicity
            key_points_text_only = [kp["text"] for kp in key_points_structured]
        except Exception as e:
            key_points_text_only = ["Could not extract specific key points."]
            print(f"Key point extraction failed: {e}")

        return {
            "summary": enhanced_summary_en,
            "key_points": key_points_text_only,
        }

    finally:
        # Clean up the temporary file
        if os.path.exists(file_location):
            os.remove(file_location)

# --- Run the FastAPI App ---
# To run this: uvicorn main:app --reload --port 8000
# Ensure you are in the 'backend' directory.
