import os
import sys
import subprocess
from dotenv import load_dotenv

print(f"Python Version: {sys.version}")
print(f"Python Executable: {sys.executable}")

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    print("✅ langchain_google_genai successfully imported")
except ImportError:
    print("❌ langchain_google_genai NOT FOUND. Attempting to install...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "langchain-google-genai"])
    from langchain_google_genai import ChatGoogleGenerativeAI
    print("✅ langchain_google_genai installed and imported")

load_dotenv()

key = os.getenv("GOOGLE_API_KEY")
print(f"Testing key: {key[:5]}...{key[-5:]}")
print(f"Key length: {len(key)}")

try:
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=key)
    response = llm.invoke("Say 'Connection Successful!'")
    print(f"Result: {response.content}")
except Exception as e:
    print(f"Error: {e}")
