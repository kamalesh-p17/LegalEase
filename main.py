import os
import json
import io
import requests
import PyPDF2
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import ikapi

# -------------------------------
# Load environment variables
# -------------------------------
load_dotenv()
KANON_API_KEY = os.getenv("KANOON_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")  # Your Gemini API key

# -------------------------------
# Kanoon API setup
# -------------------------------
class Args:
    token = KANON_API_KEY
    maxcites = 0
    maxcitedby = 0
    orig = False
    maxpages = 1
    pathbysrc = False
    numworkers = 1
    addedtoday = False
    fromdate = None
    todate = None
    sortby = None

storage = ikapi.FileStorage("data")
client = ikapi.IKApi(Args, storage)

# -------------------------------
# Step 1: Search for a case
# -------------------------------
query = "Article 21 right to life"
results = client.search(query, pagenum=0, maxpages=1)
results_json = json.loads(results)
case_id = results_json['docs'][0]['tid']

# -------------------------------
# Step 2: Fetch full case document
# -------------------------------
full_doc_json = json.loads(client.fetch_doc(case_id))

# -------------------------------
# Step 3: Extract text from PDF or HTML
# -------------------------------
case_text = ""

if "pdf_url" in full_doc_json:
    pdf_url = full_doc_json["pdf_url"]
    response = requests.get(pdf_url)
    pdf_file = io.BytesIO(response.content)
    
    reader = PyPDF2.PdfReader(pdf_file)
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            case_text += page_text + "\n"
else:
    html_content = full_doc_json.get("doc", "")
    soup = BeautifulSoup(html_content, "html.parser")
    case_text = soup.get_text(separator="\n", strip=True)

# -------------------------------
# Step 4: Chunk the text
# -------------------------------
def chunk_text(text, max_chars=2000):
    chunks = []
    start = 0
    while start < len(text):
        end = start + max_chars
        chunks.append(text[start:end])
        start = end
    return chunks

chunks = chunk_text(case_text)
summaries = []

# -------------------------------
# Step 5: Gemini API endpoint
# -------------------------------
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GOOGLE_API_KEY}"
headers = {"Content-Type": "application/json"}

# -------------------------------
# Step 6: Send each chunk to Gemini
# -------------------------------
for i, chunk in enumerate(chunks):
    print(f"Summarizing chunk {i+1}/{len(chunks)}...")
    
    data = {
        "contents": [
            {"parts": [{"text": f"Summarize the following legal text concisely:\n\n{chunk}"}]}
        ]
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(data))
    result = response.json()
    
    # Debug: Uncomment to see full API response
    # print(json.dumps(result, indent=2))
    
    # -------------------------------
    # Safely extract summary
    # -------------------------------
    chunk_summary = "No summary returned"
    try:
        # New Gemini response format
        if "predictions" in result:
            chunk_summary = result["predictions"][0]["content"][0]["text"]
        # Older format fallback
        elif "candidates" in result:
            chunk_summary = result["candidates"][0]["content"]
    except (KeyError, IndexError):
        chunk_summary = "No summary returned"
    
    summaries.append(chunk_summary.strip())

# -------------------------------
# Step 7: Combine and print final summary
# -------------------------------
final_summary = "\n\n".join(summaries)
print("=== Final Case Summary ===")
print(final_summary)
