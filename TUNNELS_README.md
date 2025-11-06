# Tunnel Management Scripts

These scripts help you manage localtunnel connections to expose your TaskMan app to the internet.

## Scripts

### `start-tunnels.bat` (Simple)
Opens two command windows with tunnels running.

**Usage:**
```bash
.\start-tunnels.bat
```

**What it does:**
- Opens a window for backend tunnel (port 3001)
- Opens a window for frontend tunnel (port 5173)
- Shows the public URLs in each window

**After running:**
1. Check each window for the public URLs
2. Manually update `frontend/.env` with the backend URL
3. Restart your frontend dev server

### `stop-tunnels.bat` (Simple)
Stops all node processes (including tunnels).

**Usage:**
```bash
.\stop-tunnels.bat
```

**Note:** This will also stop your dev servers, so you'll need to restart them.

### `restart-tunnels.ps1` (Advanced - PowerShell)
Automatically restarts tunnels and updates configuration.

**Usage:**
```powershell
powershell -ExecutionPolicy Bypass -File .\restart-tunnels.ps1
```

**What it does:**
- Stops existing tunnels
- Starts new backend and frontend tunnels
- Captures the new URLs
- Automatically updates `frontend/.env` with new backend URL
- Shows you the URLs to share

**After running:**
1. Restart your frontend dev server
2. Share the frontend URL

## Recommended Workflow

### First Time Setup
1. Make sure your backend and frontend dev servers are running
2. Run `start-tunnels.bat`
3. Note the URLs from each window
4. Update `frontend/.env` with backend URL
5. Restart frontend dev server

### Restarting Tunnels
**Option A - PowerShell (Easiest):**
```powershell
powershell -ExecutionPolicy Bypass -File .\restart-tunnels.ps1
```

**Option B - Batch Scripts:**
```bash
.\stop-tunnels.bat
.\start-tunnels.bat
# Then manually update .env and restart frontend
```

## Important Notes

- **URLs change every time**: Each time you restart tunnels, you get new URLs
- **Keep windows open**: Don't close the tunnel windows or the tunnels will stop
- **Restart frontend**: After changing `.env`, you must restart the frontend dev server
- **First-time warning**: Users may see a security warning page on first visit to localtunnel URLs

## Troubleshooting

### PowerShell Execution Policy Error
If you get an error about execution policy, run:
```powershell
powershell -ExecutionPolicy Bypass -File .\restart-tunnels.ps1
```

### Tunnels won't start
Make sure your dev servers are running on the correct ports:
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

### URLs not updating
Make sure to restart the frontend dev server after updating `.env`
