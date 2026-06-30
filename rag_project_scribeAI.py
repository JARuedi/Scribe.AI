'''
R.A.G System, Scribe.AI
'''

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/simplify")
async def simplify(file: UploadFile = File(...)):
    try:
        #1. Read the file bytes
        content = await file.read()

        #2. Open PDF and extract text
        pdf_doc = fitz.open(stream = content, filetype = "pdf")
        extracted_text = ""
        for page in pdf_doc:
            extracted_text += page.get_text()

        if not extracted_text.strip():
            return {"simplified": "The PDF appears to be empty or an unscannable image."}

        #3.Call Ollama
        prompt = (
            "You are a plain-language writing assistant. "
            "Rewrite the following text so that anyone can easily understand it. "
            "Use short sentences, simple words, and clear structure. "
            "Keep all the important information, but remove jargon and overly complex language. "
            "Organize the output with clear headings where appropriate.\n\n"
            f"TEXT TO SIMPLIFY:\n{extracted_text[:15000]}"
        )

        response = requests.post("http://localhost:11000/api/generate", json={
            "model": "llama3.2:1b",
            "prompt": prompt,
            "stream": False
        })

        return {"simplified": response.json()["response"]}

    except Exception as error:
        print(f"DETAILED ERROR: {error}")
        return {"simplified": f"Backend Error: {str(error)}"}
