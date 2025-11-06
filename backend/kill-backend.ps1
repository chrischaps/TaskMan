#!/usr/bin/env pwsh
# Kill all TaskMan backend Node.js processes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TaskMan Backend Process Killer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = "C:\Users\chris\dev\TaskMan\backend"

# Get all Node processes
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Path }

if (-not $nodeProcesses) {
    Write-Host "No Node.js processes found." -ForegroundColor Yellow
    exit 0
}

# Find processes related to TaskMan backend
$taskmanProcesses = @()
foreach ($proc in $nodeProcesses) {
    $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
    if ($cmdLine -and $cmdLine -like "*$backendPath*") {
        $taskmanProcesses += [PSCustomObject]@{
            Id = $proc.Id
            CommandLine = $cmdLine
        }
    }
}

if ($taskmanProcesses.Count -eq 0) {
    Write-Host "No TaskMan backend processes found." -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($taskmanProcesses.Count) TaskMan backend process(es):" -ForegroundColor Green
Write-Host ""

foreach ($proc in $taskmanProcesses) {
    Write-Host "  [PID $($proc.Id)]" -ForegroundColor White -NoNewline
    Write-Host " $($proc.CommandLine)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Stopping processes..." -ForegroundColor Yellow

$processIds = $taskmanProcesses | ForEach-Object { $_.Id }
Stop-Process -Id $processIds -Force -ErrorAction SilentlyContinue

Write-Host "✓ All TaskMan backend processes stopped." -ForegroundColor Green
