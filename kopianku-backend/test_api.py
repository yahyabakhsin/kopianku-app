import requests

# 1. Login to get token
response = requests.post("http://localhost:8001/api/auth/login", json={"email": "test@test.com", "password": "password"})
if response.status_code != 200:
    # Try creating user
    requests.post("http://localhost:8001/api/auth/register", json={"username": "testuser", "email": "test@test.com", "password": "password"})
    response = requests.post("http://localhost:8001/api/auth/login", json={"email": "test@test.com", "password": "password"})

token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

endpoints = [
    "/api/users/me",
    "/api/users/me/activities",
    "/api/users/me/top-cafes",
    "/api/albums",
    "/api/users/me/reservations",
    "/api/users/me/wishlist"
]

for ep in endpoints:
    url = f"http://localhost:8001{ep}"
    try:
        res = requests.get(url, headers=headers)
        print(f"{ep}: {res.status_code}")
        if res.status_code == 500:
            print("ERROR", res.text)
    except Exception as e:
        print(f"{ep} failed: {e}")
