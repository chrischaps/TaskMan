# restart-tunnels.ps1
# Restart localtunnel and automatically update frontend configuration

Write-Host "=== TaskMan Tunnel Manager ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop existing tunnels
Write-Host "Stopping existing tunnels..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*lt*"
} | Stop-Process -Force
Start-Sleep -Seconds 2

# Step 2: Start backend tunnel
Write-Host "Starting backend tunnel (port 3001)..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    lt --port 3001
}
Start-Sleep -Seconds 5

# Step 3: Start frontend tunnel
Write-Host "Starting frontend tunnel (port 5173)..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    lt --port 5173
}
Start-Sleep -Seconds 5

# Step 4: Get tunnel URLs from job output
$backendOutput = Receive-Job -Job $backendJob
$frontendOutput = Receive-Job -Job $frontendJob

$backendUrl = ($backendOutput | Select-String -Pattern "your url is: (.+)").Matches.Groups[1].Value
$frontendUrl = ($frontendOutput | Select-String -Pattern "your url is: (.+)").Matches.Groups[1].Value

Write-Host ""
Write-Host "=== Tunnel URLs ===" -ForegroundColor Cyan
Write-Host "Backend:  $backendUrl" -ForegroundColor White
Write-Host "Frontend: $frontendUrl" -ForegroundColor White
Write-Host ""

# Step 5: Update frontend .env file
if ($backendUrl) {
    Write-Host "Updating frontend/.env with new backend URL..." -ForegroundColor Yellow
    $envPath = Join-Path $PSScriptRoot "frontend\.env"
    $envContent = "# Backend API URL`nVITE_API_URL=$backendUrl`n"
    Set-Content -Path $envPath -Value $envContent
    Write-Host "Updated $envPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Restart your frontend dev server (Ctrl+C and run 'npm run dev' again)" -ForegroundColor White
Write-Host "2. Share this URL: $frontendUrl" -ForegroundColor White
Write-Host ""
Write-Host "The tunnels are running in background jobs." -ForegroundColor Yellow
Write-Host "To stop them, run: .\stop-tunnels.bat" -ForegroundColor Yellow
Write-Host ""
