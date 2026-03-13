# Terminal Commands to Check App Lock Status

## Prerequisites
- SSH access to your server
- Navigate to your application directory (usually `~/public_html/backend` or similar)

## Commands to Check Lock Status

### 1. Check Running Node.js Processes
```bash
# List all Node.js processes
ps aux | grep node

# More detailed view
ps aux | grep -E "node|nodemon|pm2" | grep -v grep

# Check specific process by name
ps aux | grep mindoroku_backend
```

### 2. Check for Lock Files
```bash
# Navigate to backend directory
cd ~/public_html/backend

# Check for common lock files
ls -la | grep -E "lock|\.pid"

# Check for PM2 lock files (if using PM2)
ls -la ~/.pm2/ | grep lock

# Check for Node.js app lock files in cPanel
find ~ -name "*lock*" -type f 2>/dev/null | grep -i node
```

### 3. Check Port Usage (if you know the port)
```bash
# Replace 5000 with your actual port
lsof -i :5000

# Or check all listening ports
netstat -tulpn | grep LISTEN

# Alternative command
ss -tulpn | grep LISTEN
```

### 4. Check PM2 Status (if using PM2)
```bash
# Check PM2 processes
pm2 list

# Check PM2 logs
pm2 logs

# Check specific app
pm2 describe mindoroku_backend

# Check PM2 status
pm2 status
```

### 5. Check cPanel Node.js App Status
```bash
# Check for Node.js app processes
ps aux | grep "node.*server.js"

# Check for nodemon processes
ps aux | grep nodemon

# Check process tree
pstree -p | grep node
```

### 6. Check for Stuck Processes
```bash
# Find processes in "D" state (uninterruptible sleep - often stuck)
ps aux | awk '$8 ~ /^D/ { print $0 }'

# Check for zombie processes
ps aux | awk '$8 ~ /^Z/ { print $0 }'
```

### 7. Check Application Logs
```bash
# Navigate to backend
cd ~/public_html/backend

# Check for log files
ls -la *.log 2>/dev/null

# Check cPanel Node.js logs (location may vary)
tail -f ~/logs/nodejs/*.log

# Or check in common log locations
tail -f /var/log/nodejs/*.log 2>/dev/null
```

### 8. Kill Stuck Processes (if found)
```bash
# Find the process ID (PID)
ps aux | grep "node.*server.js" | grep -v grep

# Kill by PID (replace XXXX with actual PID)
kill -9 XXXX

# Or kill all node processes (use with caution!)
pkill -9 node

# Kill specific app
pkill -9 -f mindoroku_backend
```

### 9. Check File Permissions
```bash
# Check backend directory permissions
ls -la ~/public_html/backend

# Check if files are locked
lsof ~/public_html/backend/server.js
```

### 10. Check System Resources
```bash
# Check memory usage
free -h

# Check disk space
df -h

# Check CPU usage
top -bn1 | head -20
```

## Complete Diagnostic Script

Run this to get a full picture:

```bash
#!/bin/bash
echo "=== Node.js Processes ==="
ps aux | grep -E "node|nodemon" | grep -v grep

echo -e "\n=== Port Usage ==="
netstat -tulpn | grep LISTEN | grep -E "5000|3000|8080"

echo -e "\n=== Lock Files ==="
find ~/public_html/backend -name "*lock*" -o -name "*.pid" 2>/dev/null

echo -e "\n=== PM2 Status ==="
pm2 list 2>/dev/null || echo "PM2 not installed or not in use"

echo -e "\n=== Application Files ==="
ls -la ~/public_html/backend/server.js 2>/dev/null

echo -e "\n=== Recent Logs ==="
tail -20 ~/logs/nodejs/*.log 2>/dev/null || echo "No logs found"
```

Save as `check_app.sh`, make executable, and run:
```bash
chmod +x check_app.sh
./check_app.sh
```

## Common Lock File Locations

```bash
# cPanel Node.js lock files (may be in these locations)
~/.cpanel/nodejs/locks/
~/nodevenv/*/locks/
/tmp/nodejs_*
/var/cpanel/nodejs/locks/
```

## Solution Commands

If you find a stuck process:

```bash
# 1. Find the PID
PID=$(ps aux | grep "node.*server.js" | grep -v grep | awk '{print $2}')

# 2. Kill it
if [ ! -z "$PID" ]; then
    kill -9 $PID
    echo "Killed process $PID"
else
    echo "No process found"
fi

# 3. Remove lock files (be careful!)
rm -f ~/public_html/backend/*.lock
rm -f ~/.cpanel/nodejs/locks/*mindoroku_backend*
```

## After Clearing Lock

1. Wait 30 seconds
2. Try starting the app again in cPanel
3. Check if it starts:
   ```bash
   ps aux | grep "node.*server.js" | grep -v grep
   ```


