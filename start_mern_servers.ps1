Write-Host "--- STARTING MERN SERVERS (EXPRESS + REACT) ---" -ForegroundColor Cyan

# 1. Start Node/Express Backend on Port 8000
Write-Host "Starting Node/Express Backend on Port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node api/index.js"

# 2. Wait a bit for backend to initialize
Start-Sleep -Seconds 2

# 3. Start Frontend (Vite)
Write-Host "Starting Frontend (Vite)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

# 4. Start Ngrok (WhatsApp Webhook Tunnel)
Write-Host "Starting Ngrok on Port 8000..." -ForegroundColor Green
if (Test-Path "c:\Users\Maheswari\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe") {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "c:\Users\Maheswari\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe http 8000"
} else {
    Write-Host "Ngrok executable not found in Downloads. Skipping Ngrok tunnel." -ForegroundColor Yellow
}

Write-Host "All MERN servers launched in separate windows!" -ForegroundColor Cyan
Write-Host "Backend (Express): http://localhost:8000"
Write-Host "Frontend (React): http://localhost:5173"
