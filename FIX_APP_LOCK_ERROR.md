# Fix: "Can't acquire lock for app: mindoroku_backend"

## Error Explanation
This error occurs in cPanel's Node.js Application Manager when:
- The app is already running and locked
- A previous start/stop operation didn't complete
- The app is in a stuck/transitional state

## Solution Steps

### Step 1: Stop the Application (if running)
1. Go to cPanel → **Setup Node.js App**
2. Find the application named `mindoroku_backend`
3. Click **Stop** (if the button is available)
4. Wait 10-15 seconds for it to fully stop

### Step 2: Check Application Status
- If status shows "Running" but you can't stop it:
  - Wait 2-3 minutes
  - Refresh the page
  - Try stopping again

### Step 3: Delete and Recreate (Recommended)
If stopping doesn't work, delete and recreate the app:

1. **Delete the Application:**
   - In Node.js App Manager, find `mindoroku_backend`
   - Click **Delete** or **Remove**
   - ⚠️ **Note:** This only deletes the app configuration, NOT your files
   - Your backend files in `public_html/backend/` remain untouched

2. **Wait 1-2 minutes** (allows lock files to clear)

3. **Recreate the Application:**
   - Click **Create Application**
   - Configure:
     ```
     Node.js version: 18.x (or latest available)
     Application mode: Production
     Application root: backend
     Application URL: (your preferred URL)
     Application startup file: server.js
     ```
   - **Important:** Use `backend` (relative path, no leading slash, no public_html)

4. **Install Dependencies:**
   - Click on your new application
   - Click **Run NPM Install**
   - Enter: `npm install --production`
   - Click **Run**

5. **Start the Application:**
   - Click **Start**
   - Check status shows "Running"

### Step 4: Alternative - Use Different App Name
If the lock persists, create the app with a slightly different name:
- `mindoroku_backend_v2`
- `mindoroku_api`
- `backend_app`

Then update your frontend API URL accordingly.

## Prevention Tips

1. **Always stop the app before making changes**
2. **Wait for operations to complete** before starting new ones
3. **Don't click buttons multiple times** - wait for response
4. **Check logs** if app won't start after lock is cleared

## Still Having Issues?

If the lock persists after 5-10 minutes:
1. Contact your hosting provider (MochaHost support)
2. They can manually clear the lock files
3. Or restart the Node.js service on their end

## Verify After Fix

Once the app starts successfully:
1. Check **View Logs** for any errors
2. Test API endpoint: `https://your-api-url.com/mindoroku_backend/api/health`
3. Should return: `{"status":"OK"}`


