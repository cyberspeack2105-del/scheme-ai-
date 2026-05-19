# Force Kill Automation for Ports 5000, 8000, 5173

Write-Host "--- FORCING PORT CLEARANCE ---" -ForegroundColor Red

$ports = 5000, 8000, 5173
foreach ($port in $ports) {
    $pids = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique
    if ($pids) {
        foreach ($p in $pids) {
            Write-Host "Killing process $p on port $port..." -ForegroundColor Yellow
            Stop-Process -Id $p -Force
        }
    }
    else {
        Write-Host "Port $port is already clear." -ForegroundColor Gray
    }
}

Write-Host "All specified ports have been cleared." -ForegroundColor Green
