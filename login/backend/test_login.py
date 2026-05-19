from auth import login_user

print("🔑 LOGIN TEST")

username = "raju"
password = "123456"

result = login_user(username, password)
print(result)
