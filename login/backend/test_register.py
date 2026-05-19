from auth import register_user

print("🔐 REGISTER TEST")

username = "raju"
password = "123456"

result = register_user(username, password)
print(result)
