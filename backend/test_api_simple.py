
import requests
import json

BASE_URL = "http://localhost:8000"

def test_insights():
    # Note: This requires a valid user session/token which is hard to get in a script.
    # But I can check if the server is up and responding for health at least.
    try:
        resp = requests.get(f"{BASE_URL}/health")
        print(f"Health Status: {resp.status_code}")
        print(f"Health Body: {resp.json()}")
    except Exception as e:
        print(f"Error connecting to server: {e}")

if __name__ == "__main__":
    test_insights()
