import requests
import os

API_URL = "http://127.0.0.1:8000"

def test_registration():
    print("Testing Registration...")
    # Create a dummy image file
    with open("test_image.jpg", "wb") as f:
        f.write(b"dummy image data")
    
    files = {
        'image': ('test_image.jpg', open('test_image.jpg', 'rb'), 'image/jpeg')
    }
    data = {
        'name': 'Test User',
        'email': 'testuser123@example.com',
        'password': 'password123'
    }
    
    try:
        response = requests.post(f"{API_URL}/register", data=data, files=files)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error during registration: {e}")
        return False
    finally:
        files['image'][1].close()
        if os.path.exists("test_image.jpg"):
            os.remove("test_image.jpg")

def test_login():
    print("\nTesting Login...")
    data = {
        'username': 'testuser123@example.com',  # Backend expects 'username' field
        'password': 'password123'
    }
    
    try:
        response = requests.post(f"{API_URL}/login", data=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error during login: {e}")
        return False

if __name__ == "__main__":
    reg_success = test_registration()
    test_login()

