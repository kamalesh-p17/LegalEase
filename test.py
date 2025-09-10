import os
import json
import requests
from dotenv import load_dotenv
from google.oauth2 import service_account
import google.auth.transport.requests

# Load environment variables
load_dotenv()

# Path to your service account JSON
SERVICE_ACCOUNT_FILE = os.getenv("SERVICE_ACCOUNT_FILE")

if not SERVICE_ACCOUNT_FILE or not os.path.exists(SERVICE_ACCOUNT_FILE):
    raise ValueError("Service account JSON path is missing or incorrect in .env")

# Required scope for Gemini API
SCOPES = ["https://www.googleapis.com/auth/generative-language"]

# Create credentials with correct scope
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)

# Refresh to get access token
auth_req = google.auth.transport.requests.Request()
credentials.refresh(auth_req)
access_token = credentials.token

# Gemini API endpoint
url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

# Example request payload
payload = {
    "contents": [
        {"parts": [{"text": "Summarize the importance of AI in law"}]}
    ]
}

# Headers with OAuth2 access token
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

# Make request
response = requests.post(url, headers=headers, json=payload)

print("=== Raw API Response ===")
print(json.dumps(response.json(), indent=2))

# Extract summary text if present
summary = (
    response.json()
    .get("candidates", [{}])[0]
    .get("content", {})
    .get("parts", [{}])[0]
    .get("text", "No summary returned")
)

print("\n=== Extracted Summary ===")
print(summary)
