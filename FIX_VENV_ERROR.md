# Quick Fix: Node.js venv Folder Error

## Error Message
```
No such application or it's broken. Unable to find app venv folder by this path: '/home/boey6172/nodevenv/pos_backend'
```

## Quick Fix Steps

### Step 1: Delete the Broken Application
1. Go to cPanel → **Setup Node.js App**
2. Find application named `pos_backend` (or similar)
3. Click **Stop** (if running)
4. Click **Delete** or **Remove**
   - ⚠️ This only deletes the app configuration, NOT your files

### Step 2: Verify Your Files Location
In **File Manager**, check where your backend files are:
- ✅ Should be in: `public_html/backend/`
- ✅ Files needed: `server.js`, `package.json`, and all folders (config, controllers, etc.)

### Step 3: Recreate Application with CORRECT Path

1. Click **Create Application**

2. Fill in these exact settings:
   ```
   Node.js version: 18.x (or latest available)
   Application mode: Production
   Application root: backend
   Application URL: api.yourdomain.com (or your preferred subdomain)
   Application startup file: server.js
   Application Entry Point: (leave blank)
   ```

3. **CRITICAL - Application Root:**
   - If files are in `public_html/backend/` → Enter: `backend`
   - If files are in `public_html/` → Enter: `.`
   - ❌ DO NOT use: `/home/boey6172/public_html/backend`
   - ❌ DO NOT use: `public_html/backend`
   - ✅ Use relative path: `backend` (no leading slash, no public_html)

### Step 4: Install Dependencies
1. Click on your newly created application
2. Click **Run NPM Install**
3. Enter: `npm install --production`
4. Click **Run**
5. Wait for completion (may take 2-5 minutes)

### Step 5: Start Application
1. Click **Start** or **Restart**
2. Status should show as "Running"
3. Check **View Logs** for any errors

## Common Mistakes to Avoid

❌ **Wrong Application Root Examples:**
- `/home/boey6172/public_html/backend` (absolute path)
- `public_html/backend` (includes public_html)
- `/backend` (leading slash)
- `backend/` (trailing slash)

✅ **Correct Application Root Examples:**
- `backend` (if files in public_html/backend/)
- `.` (if files in public_html/)
- `app` (if files in public_html/app/)

## Verification

After fixing, you should see:
- ✅ Application status: **Running**
- ✅ Virtual environment path created automatically
- ✅ Logs showing server started
- ✅ API accessible at your chosen URL

## Still Not Working?

1. **Check File Structure:**
   ```
   public_html/
   └── backend/
       ├── server.js
       ├── package.json
       ├── .env
       ├── config/
       ├── controllers/
       └── ... (other folders)
   ```

2. **Check Application Root Again:**
   - Must match the folder name relative to `public_html/`
   - If structure is `public_html/backend/` → root is `backend`
   - If structure is `public_html/myapp/` → root is `myapp`

3. **Contact Support:**
   - Provide the error message
   - Tell them your Application Root setting
   - Share your file structure location

## Quick Reference

| Your File Location | Application Root |
|-------------------|------------------|
| `public_html/backend/` | `backend` |
| `public_html/api/` | `api` |
| `public_html/` (root) | `.` |
| `public_html/app/backend/` | `app/backend` |

---

**Need More Help?** See `DEPLOYMENT_INSTRUCTIONS.md` for complete deployment guide.










