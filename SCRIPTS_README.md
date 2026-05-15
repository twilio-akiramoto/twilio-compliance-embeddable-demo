# Demo Management Scripts

This project includes convenient shell scripts to manage the backend and frontend servers.

## Available Scripts

### 🚀 `./start.sh` - Start Demo

Starts both backend and frontend servers in the background.

**Features:**
- ✅ Checks for existing running processes
- ✅ Installs dependencies if needed
- ✅ Waits for servers to be ready
- ✅ Validates health endpoints
- ✅ Shows mock mode status
- ✅ Opens browser automatically (macOS)
- ✅ Creates PID files for management
- ✅ Logs output to `logs/` directory

**Usage:**
```bash
./start.sh
```

**Output:**
```
╔══════════════════════════════════════════════════════════╗
║  Twilio Compliance Embeddable Demo - Startup Script     ║
╚══════════════════════════════════════════════════════════╝

[1/2] Starting Backend Server...
   ✅ Backend started successfully (PID: 12345)
   📡 Health check: http://localhost:3011/health
   ⚠️  AU Alphanumeric Mock Mode: ENABLED

[2/2] Starting Frontend Server...
   ✅ Frontend started successfully (PID: 12346)
   🌐 Application: http://localhost:3010

╔══════════════════════════════════════════════════════════╗
║              🎉 Demo Started Successfully! 🎉            ║
╚══════════════════════════════════════════════════════════╝

📍 Application URLs:
   Frontend:  http://localhost:3010
   Backend:   http://localhost:3011
   Health:    http://localhost:3011/health
```

---

### 🛑 `./stop.sh` - Stop Demo

Stops both backend and frontend servers gracefully.

**Features:**
- ✅ Graceful shutdown with fallback to force kill
- ✅ Cleans up PID files
- ✅ Frees up ports 3010 and 3011
- ✅ Kills all related child processes
- ✅ Shows count of stopped services

**Usage:**
```bash
./stop.sh
```

**Output:**
```
╔══════════════════════════════════════════════════════════╗
║  Twilio Compliance Embeddable Demo - Shutdown Script    ║
╚══════════════════════════════════════════════════════════╝

🛑 Stopping Backend (PID: 12345)...
   ✅ Backend stopped

🛑 Stopping Frontend (PID: 12346)...
   ✅ Frontend stopped

🧹 Cleaning up remaining processes...
   ✅ Cleanup complete

╔══════════════════════════════════════════════════════════╗
║          ✅ Demo Stopped Successfully! (2 services)      ║
╚══════════════════════════════════════════════════════════╝
```

---

### 📊 `./status.sh` - Check Status

Checks the status of both servers and displays detailed information.

**Features:**
- ✅ Shows running/stopped status
- ✅ Displays PID information
- ✅ Checks health endpoints
- ✅ Shows CPU and memory usage
- ✅ Displays mock mode status
- ✅ Lists log file locations
- ✅ Color-coded output

**Usage:**
```bash
./status.sh
```

**Output:**
```
╔══════════════════════════════════════════════════════════╗
║    Twilio Compliance Embeddable Demo - Status Check     ║
╚══════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Status:     ✅ Running
   PID:        12345
   Health:     ✅ Healthy
   URL:        http://localhost:3011
   Mock Mode:  ⚠️  ENABLED (AU Alphanumeric)
   CPU:        0.5%
   Memory:     1.2%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Status:     ✅ Running
   PID:        12346
   Health:     ✅ Responding
   URL:        http://localhost:3010
   CPU:        2.3%
   Memory:     3.8%
   Processes:  5 child processes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✅ All services running (2/2)

╔══════════════════════════════════════════════════════════╗
║              🎉 Demo is Fully Operational! 🎉           ║
╚══════════════════════════════════════════════════════════╝
```

**Exit Codes:**
- `0` - All services running
- `1` - Some services running
- `2` - No services running

---

### 🔄 `./restart.sh` - Restart Demo

Stops and then starts both servers.

**Usage:**
```bash
./restart.sh
```

This is equivalent to:
```bash
./stop.sh && ./start.sh
```

---

## Log Files

Logs are stored in the `logs/` directory:

- **Backend:** `logs/backend.log`
- **Frontend:** `logs/frontend.log`

**View logs in real-time:**
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
tail -f logs/frontend.log

# Both logs (split terminal or use tmux/screen)
tail -f logs/*.log
```

## PID Files

Process IDs are stored in the `logs/` directory:

- **Backend PID:** `logs/backend.pid`
- **Frontend PID:** `logs/frontend.pid`

These files are automatically created on start and removed on stop.

## Port Configuration

Default ports:
- **Frontend:** 3010
- **Backend:** 3011

To change ports:
1. Edit `backend/.env` - Change `PORT=3011`
2. Edit `frontend/.env` - Change `REACT_APP_API_URL=http://localhost:3011/api`
3. Update the scripts if needed

## Troubleshooting

### Port Already in Use

If you get "address already in use" errors:

```bash
# Check what's using the ports
lsof -i:3010
lsof -i:3011

# Kill processes on those ports
lsof -ti:3010 | xargs kill -9
lsof -ti:3011 | xargs kill -9

# Or use the stop script (handles this automatically)
./stop.sh
```

### Stale PID Files

If servers won't start due to stale PID files:

```bash
rm -f logs/*.pid
./start.sh
```

### Logs Not Appearing

If log files aren't being created:

```bash
mkdir -p logs
./restart.sh
```

### Backend Not Responding

Check the backend log for errors:

```bash
tail -50 logs/backend.log
```

Common issues:
- Missing `.env` file → Copy from `.env.example`
- Invalid Twilio credentials → Check `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
- Port conflict → Use `./stop.sh` to clean up

### Frontend Not Loading

Check the frontend log:

```bash
tail -50 logs/frontend.log
```

Common issues:
- Dependencies not installed → Run `cd frontend && npm install`
- Backend not running → Check `./status.sh`
- Wrong API URL → Check `frontend/.env`

## Manual Control

If you prefer manual control:

### Start Backend
```bash
cd backend
npm start
```

### Start Frontend
```bash
cd frontend
npm start
```

### Stop (Ctrl+C in each terminal)

## Advanced Usage

### Run in Foreground

To see logs in the terminal:

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm start
```

### Custom Log Location

Edit the scripts and change:
```bash
BACKEND_LOG="$SCRIPT_DIR/logs/backend.log"
FRONTEND_LOG="$SCRIPT_DIR/logs/frontend.log"
```

### Disable Browser Auto-Open

In `start.sh`, comment out:
```bash
# open http://localhost:3010
```

Or set environment variable:
```bash
BROWSER=none ./start.sh
```

## Integration with Development

### Using with Git Hooks

Add to `.git/hooks/post-checkout`:
```bash
#!/bin/bash
./restart.sh
```

### Using with Docker

These scripts work alongside Docker. If you prefer Docker:

```bash
# Create docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3011:3011"
    env_file:
      - ./backend/.env
  frontend:
    build: ./frontend
    ports:
      - "3010:3010"
    environment:
      - REACT_APP_API_URL=http://localhost:3011/api
```

Then use:
```bash
docker-compose up -d    # Start
docker-compose down     # Stop
docker-compose logs -f  # View logs
```

## CI/CD Integration

These scripts can be used in CI/CD pipelines:

```bash
# Start for testing
./start.sh

# Wait for readiness
timeout 60 bash -c 'until curl -s http://localhost:3011/health; do sleep 1; done'

# Run tests
npm test

# Stop
./stop.sh
```

## Windows Support

These scripts are written for Unix-like systems (macOS, Linux). For Windows:

**Option 1: WSL (Recommended)**
```powershell
wsl ./start.sh
```

**Option 2: Git Bash**
```bash
bash start.sh
```

**Option 3: Create PowerShell Equivalents**
```powershell
# start.ps1
cd backend
Start-Process -NoNewWindow npm start
cd ../frontend
Start-Process -NoNewWindow npm start
```

## Summary

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `./start.sh` | Start demo | First time or after stop |
| `./stop.sh` | Stop demo | End of work session |
| `./restart.sh` | Restart demo | After config changes |
| `./status.sh` | Check status | Troubleshooting |

**Quick Reference:**
```bash
./start.sh     # Start everything
./status.sh    # Check if running
./stop.sh      # Stop everything
./restart.sh   # Restart (stop + start)
```

**Pro Tip:** Add an alias to your shell profile:
```bash
# In ~/.bashrc or ~/.zshrc
alias demo-start='cd /path/to/demo && ./start.sh'
alias demo-stop='cd /path/to/demo && ./stop.sh'
alias demo-status='cd /path/to/demo && ./status.sh'
```

Then use anywhere:
```bash
demo-start
demo-status
demo-stop
```
