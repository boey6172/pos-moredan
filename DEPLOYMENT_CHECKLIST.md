# Quick Deployment Checklist - MochaHost cPanel

## Pre-Deployment
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Gather all backend files (excluding node_modules)

## Database Setup (cPanel)
- [ ] Create PostgreSQL database in cPanel
- [ ] Create PostgreSQL user
- [ ] Assign user to database with ALL privileges
- [ ] Note connection details (host, port, database, user, password)

## File Upload
- [ ] Create `backend/` directory in public_html
- [ ] Upload backend files (config, controllers, models, routes, etc.)
- [ ] Upload `package.json` and `package-lock.json`
- [ ] Create empty `uploads/` folder with 755 permissions
- [ ] Create `frontend-build/` directory
- [ ] Upload all contents from `frontend/build/` folder

## Environment Configuration
- [ ] Create `.env` file in `backend/` directory
- [ ] Add database connection details
- [ ] Add JWT_SECRET
- [ ] Set PORT (check Node.js app assigned port)
- [ ] Set file permissions to 600

## Node.js Application Setup (cPanel)
- [ ] Access "Setup Node.js App" in cPanel
- [ ] Create new Node.js application
- [ ] Set application root: `backend` (relative path, NO leading slash, NO public_html)
- [ ] Set startup file: `server.js`
- [ ] Choose Node.js version
- [ ] Run: `npm install --production`
- [ ] Start the application
- [ ] **If venv folder error:** Delete app, recreate with correct relative path (see FIX_VENV_ERROR.md)

## Frontend Configuration
- [ ] Update `frontend/src/api/axios.js` baseURL (rebuild if needed)
- [ ] Or update built JS files with correct API URL
- [ ] Configure domain/subdomain pointing to frontend-build

## Security & Final Steps
- [ ] Update CORS origin in `server.js`
- [ ] Install SSL certificate
- [ ] Set file permissions (uploads: 755)
- [ ] Test API: `https://your-api-url.com/api/health`
- [ ] Test frontend login
- [ ] Create admin user in database
- [ ] Check application logs for errors

## Testing
- [ ] Backend API responds
- [ ] Frontend loads correctly
- [ ] Database connection works
- [ ] Login functionality works
- [ ] Image upload works
- [ ] All features tested

---

**Quick Commands:**
- Build frontend: `cd frontend && npm run build`
- Test API: `curl https://your-api-url.com/api/health`
- View logs: cPanel → Node.js App → View Logs

