import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

print(f"--- Gemini Model Discovery ---")
print(f"Key: {api_key[:5]}...{api_key[-5:]}")

genai.configure(api_key=api_key)

print("\nAvailable Models:")
try:
    models = list(genai.list_models())
    if not models:
        print("No models found!")
    for m in models:
        print(f" - ID: {m.name}")
        print(f"   DisplayName: {m.display_name}")
        print(f"   Methods: {m.supported_generation_methods}")
        print("-" * 20)
except Exception as e:
    print(f"Error listing models: {e}")

print("\nTesting simple invocation...")
try:
    # Try gemini-1.5-flash which is standard
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hi")
    print(f"Flash Success: {response.text}")
except Exception as e:
    print(f"Flash Failed: {e}")
