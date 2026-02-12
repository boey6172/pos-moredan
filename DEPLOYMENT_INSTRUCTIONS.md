# MochaHost cPanel Deployment Instructions
## POS System - Step-by-Step Deployment Guide

---

## Prerequisites
- MochaHost cPanel account with Node.js support
- PostgreSQL database access enabled
- FTP/File Manager access
- Domain or subdomain configured

---

## STEP 1: Prepare Your Local Files

### 1.1 Create Production Build of Frontend
```bash
cd frontend
npm install
npm run build
```
This creates a `build` folder in the frontend directory.

### 1.2 Prepare Backend Files
Ensure your backend is ready:
- All dependencies listed in `package.json`
- No development dependencies in production
- `.env` file prepared (but don't upload it yet - we'll create it on server)

---

## STEP 2: Set Up PostgreSQL Database in cPanel

### 2.1 Create PostgreSQL Database
1. Log into **cPanel**
2. Navigate to **PostgreSQL Databases** (under Databases section)
3. Create a new database:
   - Enter database name: `boey6172_boey6172_pos_db` (or your preferred name)
   - Click **Create Database**

### 2.2 Create PostgreSQL User
1. In the same **PostgreSQL Databases** section
2. Scroll to **Add New User**
3. Create user: `boey6172_pos_user` (or your preferred username)
4. Set a strong password
5. Click **Create User**

### 2.3 Assign User to Database
1. Scroll to **Add User To Database**
2. Select the user: `boey6172_pos_user`
3. Select the database: `boey6172_boey6172_pos_db`
4. Click **Add**
5. Grant **ALL PRIVILEGES** to the user

### 2.4 Get Connection Details
Note down the following from cPanel:
- **Host:** Usually `localhost` (check Remote PostgreSQL section if different)
- **Port:** Default is `5432`
- **Database Name:** `boey6172_boey6172_pos_db`
- **Username:** `boey6172_pos_user`
- **Password:** (the one you just created)

---

## STEP 3: Upload Files to Server

### 3.1 Access File Manager
1. In cPanel, go to **File Manager**
2. Navigate to your domain's root directory (usually `public_html` or a subdomain folder)

### 3.2 Create Directory Structure
Create the following structure:
```
public_html/
├── backend/          (Backend Node.js application)
├── frontend-build/   (Frontend production build)
└── .env             (Environment variables - create later)
```

### 3.3 Upload Backend Files
1. Navigate to `public_html/backend/` (create if doesn't exist)
2. Upload all backend files EXCEPT:
   - `node_modules/` (don't upload - we'll install on server)
   - `.env` (we'll create this on server)
   - `uploads/` folder (create empty folder, ensure it's writable)

Required backend files to upload:
- `config/`
- `controllers/`
- `middleware/`
- `models/`
- `routes/`
- `utils/`
- `server.js`
- `package.json`
- `package-lock.json` (if available)

### 3.4 Upload Frontend Build
1. Navigate to `public_html/frontend-build/`
2. Upload ALL contents from your local `frontend/build/` folder
   - Should include: `index.html`, `static/` folder, `manifest.json`, etc.

---

## STEP 4: Configure Backend Environment Variables

### 4.1 Create .env File
1. In cPanel File Manager, navigate to `public_html/backend/`
2. Create a new file named `.env`
3. Add the following content (replace with your actual values):

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boey6172_boey6172_pos_db
DB_USER=boey6172_pos_user
DB_PASS=your_actual_password_here

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Secret (generate a random string)
JWT_SECRET=your_secure_random_jwt_secret_here
```

**Important:**
- Replace `your_actual_password_here` with your PostgreSQL user password
- Replace `JWT_SECRET` with a secure random string (you can generate one online)
- If your host is different from `localhost`, update `DB_HOST`

### 4.2 Set File Permissions
1. Right-click `.env` file
2. Set permissions to `600` (read/write for owner only) for security

---

## STEP 5: Set Up Node.js Application in cPanel

### 5.1 Access Node.js Selector
1. In cPanel, find **Setup Node.js App** (under Software section)
2. Click to open Node.js Application Manager

### 5.2 Create Node.js Application
1. Click **Create Application**
2. Configure the application:
   - **Node.js version:** Select latest stable version (14.x, 16.x, or 18.x)
   - **Application mode:** Production
   - **Application root:** `backend` (relative to your domain root)
   - **Application URL:** Choose subdomain or subdirectory (e.g., `api.yourdomain.com` or `yourdomain.com/api`)
   - **Application startup file:** `server.js`
   - **Application Entry Point:** Leave blank or enter `server.js`

### 5.3 Install Dependencies
1. After creating the app, click on your application
2. Click **Run NPM Install**
3. Enter: `npm install --production`
4. Click **Run**

**Note:** This may take several minutes. Wait for completion.

### 5.4 Start the Application
1. In Node.js App Manager, find your application
2. Click **Start** or **Restart**
3. Verify it's running (status should show as running)

---

## STEP 6: Configure Server Port

### 6.1 Update server.js (if needed)
If MochaHost uses a specific port or socket, you may need to update `backend/server.js`:

Check the Node.js App Manager for the port number assigned. If different from 5000, update your `.env` file:
```env
PORT=your_assigned_port
```

### 6.2 Update Frontend API URL
1. In File Manager, navigate to `public_html/frontend-build/static/js/`
2. Find the main JavaScript bundle (usually `main.xxxxx.js`)
3. Search for `localhost:5000` and replace with your actual API URL
   - If API is at `api.yourdomain.com`, use that
   - If API is at `yourdomain.com/api`, use that

**Alternative:** Update `frontend/src/api/axios.js` before building:
```javascript
baseURL: 'https://api.yourdomain.com'  // or your actual API URL
```
Then rebuild the frontend (`npm run build`) and re-upload the build folder.

---

## STEP 7: Set Up Frontend (Static Files)

### 7.1 Option A: Using Subdomain/Domain
1. Point your domain or subdomain to `public_html/frontend-build/`
2. In cPanel, go to **Subdomains** (if using subdomain)
3. Point document root to `public_html/frontend-build`

### 7.2 Option B: Using Main Domain
1. Move contents of `frontend-build/` to `public_html/` root
2. Or set up redirect from main domain to frontend-build folder

---

## STEP 8: Configure File Permissions

### 8.1 Set Uploads Directory Permissions
1. Navigate to `public_html/backend/uploads/`
2. Set folder permissions to `755`
3. Set file permissions inside to `644` (for uploaded images)

This ensures the application can write uploaded product images.

---

## STEP 9: Database Migration/Setup

### 9.1 Initialize Database Schema
The application uses Sequelize's `sync()` method which automatically creates tables.

1. Ensure your Node.js app is running
2. Visit: `https://your-api-url.com/api/health`
3. If it responds with `{"status":"OK"}`, the database tables should be created automatically

### 9.2 Create Admin User
You'll need to create an admin user manually. You can:
- Use cPanel's phpPgAdmin to insert a user directly into the database
- Or create an initial setup script to run once
- Or use a database GUI tool to add the first admin user

**Admin user SQL (hashed password example - you'll need to generate your own):**
```sql
INSERT INTO "Users" (username, password, role, "createdAt", "updatedAt")
VALUES ('admin', '$2a$10$hashedpasswordhere', 'admin', NOW(), NOW());
```

---

## STEP 10: Configure CORS and Security

### 10.1 Update CORS Settings
In `backend/server.js`, update the CORS origin:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com'  // Replace with your frontend URL
}));
```

Re-upload the file and restart the Node.js app.

---

## STEP 11: Testing

### 11.1 Test Backend API
1. Visit: `https://api.yourdomain.com/api/health`
2. Should return: `{"status":"OK"}`

### 11.2 Test Frontend
1. Visit your frontend URL
2. Try to log in (if admin user exists)
3. Test basic functionality

### 11.3 Check Logs
1. In Node.js App Manager, click **View Logs** or **Errors**
2. Check for any runtime errors
3. Fix any issues that appear

---

## STEP 12: SSL Certificate (Important!)

### 12.1 Enable SSL
1. In cPanel, go to **SSL/TLS Status**
2. Install a free SSL certificate (Let's Encrypt) if available
3. Force HTTPS redirect if possible

### 12.2 Update API URLs to HTTPS
Ensure all API calls use `https://` instead of `http://`

---

## Troubleshooting

### Database Connection Issues
- Verify database credentials in `.env`
- Check if PostgreSQL service is running
- Ensure user has proper permissions
- Try connecting using phpPgAdmin to verify credentials

### Node.js App Won't Start
- Check Node.js logs in cPanel
- Verify all dependencies are installed
- Ensure `.env` file exists and has correct values
- Check file permissions

### "No such application or it's broken. Unable to find app venv folder" Error

**Error Message:** `No such application or it's broken. Unable to find app venv folder by this path: '/home/boey6172/nodevenv/pos_backend'`

This error occurs when the Node.js application path is configured incorrectly in cPanel. Follow these steps to fix:

#### Solution 1: Delete and Recreate the Application
1. In cPanel, go to **Setup Node.js App**
2. Find your application (likely named `pos_backend`)
3. Click **Stop** if it's running
4. Click **Delete** or **Remove** to delete the application
5. **Important:** Do NOT delete the files, only delete the Node.js app configuration

#### Solution 2: Create New Application with Correct Path
1. Click **Create Application**
2. Fill in the details:
   - **Node.js version:** Select latest stable (e.g., 18.x or 20.x)
   - **Application mode:** Production
   - **Application root:** 
     - If your files are in `public_html/backend`, enter: `backend`
     - If your files are directly in `public_html`, enter: `.` (dot)
     - **IMPORTANT:** This should be relative to your domain root, NOT an absolute path
   - **Application URL:** Choose or create subdomain/subdirectory for API
     - Example: `api.yourdomain.com` or `yourdomain.com/api`
   - **Application startup file:** `server.js`
   - **Application Entry Point:** Leave blank (or enter `server.js` if required)
   - **Passenger App File:** Leave blank (or `server.js` if using Passenger)

#### Solution 3: Verify File Location
1. In cPanel **File Manager**, verify your backend files are located correctly:
   - Should be in: `public_html/backend/` (if Application root is set to `backend`)
   - OR in: `public_html/` (if Application root is set to `.`)
2. Ensure `server.js` exists in the correct location
3. Ensure `package.json` exists in the same directory as `server.js`

#### Solution 4: Check Application Root Path Format
The **Application root** field should be:
- ✅ Correct: `backend` (relative path, no leading slash)
- ✅ Correct: `.` (for current directory)
- ❌ Wrong: `/home/boey6172/public_html/backend` (absolute path)
- ❌ Wrong: `public_html/backend` (includes public_html)
- ❌ Wrong: `/backend` (leading slash)

#### Solution 5: Alternative - Use Full Path (If Relative Doesn't Work)
Some cPanel versions require full path. If relative path doesn't work:
1. Find your full home path in File Manager (usually shown at top)
2. If your files are in `public_html/backend`, the full path might be:
   - `/home/boey6172/public_html/backend`
3. Enter this full path in **Application root** field
4. **Note:** This is less common, try relative path first

#### After Fixing:
1. Click **Create** or **Save**
2. Click on your application
3. Click **Run NPM Install**
4. Enter: `npm install --production`
5. Click **Run** and wait for completion
6. Click **Start** or **Restart**
7. Check **View Logs** or **Errors** if issues persist

#### Verify Path is Correct:
After creating the app, you should see the virtual environment path created automatically, something like:
- `/home/boey6172/nodevenv/your_app_name/18/bin/activate`

If you still see the old path error, the application root is still incorrect.

### 404 Errors on Frontend
- Verify all files uploaded correctly
- Check `.htaccess` file (if needed)
- Ensure correct document root is set

### API Not Accessible
- Check Node.js app is running
- Verify port number
- Check firewall/security settings
- Test API endpoint directly in browser

### Image Upload Issues
- Verify `uploads/` folder exists
- Check folder permissions (755)
- Ensure enough disk space
- Check file size limits in server configuration

---

## Post-Deployment Checklist

- [ ] PostgreSQL database created and configured
- [ ] Backend files uploaded to server
- [ ] Frontend build uploaded to server
- [ ] `.env` file created with correct credentials
- [ ] Node.js application created and started
- [ ] Dependencies installed (`npm install --production`)
- [ ] Database tables created (via Sequelize sync)
- [ ] Admin user created
- [ ] Frontend API URL updated to production
- [ ] CORS configured correctly
- [ ] SSL certificate installed
- [ ] File permissions set correctly
- [ ] Application tested and working
- [ ] Logs checked for errors

---

## Additional Notes

### Updating the Application
1. Upload new files via File Manager or FTP
2. In Node.js App Manager, click **Restart**
3. For frontend: Rebuild locally and re-upload build folder

### Backup Strategy
- Regularly backup your PostgreSQL database via cPanel
- Keep backups of your `.env` file (securely stored)
- Backup uploaded images in `backend/uploads/`

### Performance Optimization
- Enable gzip compression in cPanel
- Consider using a CDN for static assets
- Optimize images before uploading
- Monitor server resources

---

## MochaHost Specific Considerations

1. **Check Node.js Version:** MochaHost may have specific Node.js versions available
2. **Port Configuration:** Some hosts use reverse proxy - verify with support
3. **PostgreSQL Path:** Connection might use socket path - contact support if issues
4. **File Upload Limits:** Check PHP/file upload limits in cPanel
5. **Memory Limits:** Node.js apps may have memory restrictions

---

## Support Contacts

- **MochaHost Support:** Check your hosting account for support contact
- **cPanel Documentation:** Available in your cPanel interface
- **Application Issues:** Check server logs and error messages

---

**Last Updated:** [Current Date]
**Version:** 1.0

