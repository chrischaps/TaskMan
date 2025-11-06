# Mobile Testing Guide

This guide explains how to test the TaskMan app on your mobile phone while connected to the same WiFi network as your development machine.

## Prerequisites

- Your phone and development machine must be on the same WiFi network
- Backend and frontend dev servers must be running
- Firewall may need to allow incoming connections (see Troubleshooting section)

## Security

The mobile testing configuration is designed to be secure:
- **CORS restrictions**: Only allows connections from localhost and private IP ranges
- **No public access**: Only devices on your local network can connect
- **Private IP ranges**: 192.168.x.x, 10.x.x.x, 172.16-31.x.x
- **Credentials support**: Full authentication with JWT tokens

This configuration is safe for local development and testing.

## Configuration

The following changes have been made to enable mobile testing:

### Frontend (Vite)
`frontend/vite.config.ts` now exposes the dev server on all network interfaces:
```typescript
server: {
  host: '0.0.0.0',  // Listen on all interfaces
  port: 5173,
  strictPort: true,
}
```

### Backend (Express)
`backend/src/server.ts` includes:
1. CORS configuration accepting local network IPs
2. Server listening on 0.0.0.0 (all interfaces)

## Step-by-Step Instructions

### 1. Find Your Local IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active WiFi adapter (usually starts with 192.168.x.x)

**Mac/Linux:**
```bash
ifconfig
```
or
```bash
ip addr show
```
Look for your WiFi interface (usually starts with 192.168.x.x or 10.x.x.x)

**Example:** Your IP might be `192.168.1.100`

### 2. Start Development Servers

Make sure both servers are running:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server should show:
```
🚀 TaskMan API server running on http://localhost:3001
📱 Local network access: http://[YOUR-LOCAL-IP]:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Vite should show:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

### 3. Update Frontend Environment Variable

Edit `frontend/.env` and add your local IP to the API URL:

```env
# For mobile testing - replace with your actual local IP
VITE_API_URL=http://192.168.1.100:3001
```

**Important:** Restart the frontend dev server after changing .env

### 4. Access from Mobile

On your phone's browser, navigate to:
```
http://[YOUR-LOCAL-IP]:5173
```

**Example:** `http://192.168.1.100:5173`

## Testing Checklist

- [ ] Frontend loads on mobile browser
- [ ] Can register a new account
- [ ] Can log in with credentials
- [ ] Can view task board
- [ ] Can accept and complete a task
- [ ] Token balance updates correctly
- [ ] Navigation works (back button, links)
- [ ] Touch interactions work properly
- [ ] Forms and inputs work (keyboard appears)
- [ ] API calls succeed (check Network tab in mobile browser dev tools)

## Troubleshooting

### Cannot Connect from Phone

**1. Check Firewall (Windows)**
- Open Windows Defender Firewall
- Click "Allow an app through firewall"
- Ensure Node.js is allowed on Private networks

**2. Check Firewall (Mac)**
- System Preferences → Security & Privacy → Firewall
- Click Firewall Options
- Add Node if not listed

**3. Verify Same Network**
- Phone and computer must be on same WiFi network
- Some guest networks isolate devices - use main network

**4. Test Connection**
Try accessing the health endpoint from phone browser:
```
http://[YOUR-LOCAL-IP]:3001/api/health
```
Should return JSON with `"status": "healthy"`

### CORS Errors

If you see CORS errors in mobile browser console:

1. **Check Origin**: The error message will show the origin. It should match the pattern `http://192.168.x.x:5173`

2. **Verify Pattern**: The backend CORS regex allows:
   - `192.168.x.x` (most home networks)
   - `10.x.x.x` (some home/corporate networks)
   - `172.16-31.x.x` (some corporate networks)

3. **Update Pattern**: If your IP doesn't match, edit `backend/src/server.ts` line 29 to include your network range.

### Frontend Cannot Reach Backend

1. **Check VITE_API_URL**: Ensure it points to your actual local IP
2. **Restart Frontend**: After changing .env, restart `npm run dev`
3. **Check Backend Logs**: Look for incoming requests in backend terminal

### Slow Performance

Mobile testing over WiFi can be slower than localhost:
- Network latency is higher
- Enable React DevTools on mobile to debug rendering issues
- Check backend terminal for slow API responses

## Reverting to Localhost-Only

To disable mobile access and return to localhost-only:

**1. Frontend:**
Edit `frontend/vite.config.ts`:
```typescript
server: {
  port: 5173,
  strictPort: true,
}
// Remove or comment out 'host: 0.0.0.0'
```

**2. Backend:**
Edit `backend/src/server.ts`:
```typescript
// Change allowed origins to only include localhost
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

// Remove or comment out localNetworkPattern check

// Change listen call
app.listen(PORT, 'localhost', () => {
  // ...
});
```

**3. Frontend .env:**
```env
VITE_API_URL=http://localhost:3001
```

## Additional Resources

- [Vite Network Configuration](https://vitejs.dev/config/server-options.html#server-host)
- [Express CORS Documentation](https://expressjs.com/en/resources/middleware/cors.html)
- [Private IP Address Ranges (RFC 1918)](https://datatracker.ietf.org/doc/html/rfc1918)

## Notes

- Mobile Safari may cache aggressively - force refresh if changes don't appear
- Chrome mobile allows remote debugging via USB
- Consider using ngrok for testing outside your local network (requires separate security setup)
