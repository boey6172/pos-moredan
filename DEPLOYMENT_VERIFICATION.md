# Deployment Verification Guide
## For: https://yggdrasilsolution.com/moredansmv

This document ensures the app is correctly configured for subdirectory deployment.

## ✅ Configuration Checklist

### 1. Package.json Homepage
**Status:** ✅ Configured
- `homepage` is set to `/moredansmv` (path only, not full URL)
- This tells Create React App to build assets with the correct base path

### 2. React Router Basename
**Status:** ✅ Configured
- `App.js` uses `basename` from `process.env.PUBLIC_URL` or `REACT_APP_PUBLIC_URL`
- `PUBLIC_URL` is automatically extracted from `homepage` during build
- In production build, `PUBLIC_URL` will be `/moredansmv`

### 3. API Configuration
**Status:** ✅ Configured
- `axios.js` uses `REACT_APP_API_BASE_URL` environment variable
- Default fallback: `https://yggdrasilsolution.com/backend_pos`
- Can be overridden via `.env` file

### 4. Navigation
**Status:** ✅ Configured
- All navigation uses React Router's `useNavigate()` hook
- Navigation paths are relative (e.g., `/dashboard`, `/pos`)
- React Router automatically prepends basename

## 🔧 Build & Deploy Process

### Step 1: Set Environment Variables (if needed)
Create `frontend/.env` file:
```env
REACT_APP_API_BASE_URL=https://yggdrasilsolution.com/backend_pos
REACT_APP_HOMEPAGE=/moredansmv
```

### Step 2: Build the App
```bash
cd frontend
npm run build
```

### Step 3: Verify Build Output
After building, check `frontend/build/index.html`:
- All script and CSS paths should start with `/moredansmv/static/...`
- `%PUBLIC_URL%` should be replaced with `/moredansmv`

### Step 4: Deploy Files
Upload the contents of `frontend/build/` to your web server at:
```
https://yggdrasilsolution.com/moredansmv/
```

## 🧪 Testing After Deployment

### Test 1: Root Access
✅ Visit: `https://yggdrasilsolution.com/moredansmv/`
- Should load the app (or redirect to `/login`)

### Test 2: Direct Route Access
✅ Visit: `https://yggdrasilsolution.com/moredansmv/login`
- Should load login page directly

✅ Visit: `https://yggdrasilsolution.com/moredansmv/dashboard`
- Should load dashboard (if logged in) or redirect to login

### Test 3: Navigation
✅ After login, navigate to different pages:
- Dashboard → POS → Products → Transactions
- All navigation should work without page refresh

### Test 4: Asset Loading
✅ Open browser DevTools (F12) → Network tab
- All CSS/JS files should load from `/moredansmv/static/...`
- No 404 errors for assets

### Test 5: API Calls
✅ Open browser DevTools (F12) → Network tab
- API calls should go to `https://yggdrasilsolution.com/backend_pos/api/...`
- All API requests should succeed

### Test 6: Browser Refresh
✅ Navigate to any route (e.g., `/dashboard`)
✅ Refresh the page (F5)
- Should stay on the same route (not show 404)
- Server must be configured to serve `index.html` for all routes

## 🐛 Troubleshooting

### Issue: 404 on Direct Route Access
**Solution:** Server must serve `index.html` for all routes. Configure your web server (Apache/Nginx) with fallback to `index.html`.

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /moredansmv/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /moredansmv/index.html [L]
</IfModule>
```

**Nginx:**
```nginx
location /moredansmv {
  try_files $uri $uri/ /moredansmv/index.html;
}
```

### Issue: Assets Not Loading (404 on CSS/JS)
**Check:**
1. Verify `homepage` in `package.json` is `/moredansmv` (not full URL)
2. Rebuild the app: `npm run build`
3. Check that all files from `build/` folder are uploaded

### Issue: API Calls Failing
**Check:**
1. Verify `REACT_APP_API_BASE_URL` in `.env` or hardcoded in `axios.js`
2. Check CORS settings on backend
3. Verify backend is accessible at `https://yggdrasilsolution.com/backend_pos`

### Issue: Routes Work in Dev but Not in Production
**Check:**
1. Verify `basename` is set in `Router` component
2. Rebuild after any `package.json` or routing changes
3. Clear browser cache

## 📝 Notes

- **Development (`npm start`)**: Works at `localhost:3000` with empty basename
- **Production Build**: Uses `/moredansmv` basename automatically from `homepage` setting
- **Environment Variables**: Must start with `REACT_APP_` prefix to be available at runtime
- **Rebuild Required**: Any changes to `homepage`, `basename`, or routing require a rebuild

## 🔗 Related Files

- `frontend/package.json` - Homepage configuration
- `frontend/src/App.js` - Router basename configuration
- `frontend/src/api/axios.js` - API base URL configuration
- `frontend/.env` - Environment variables (if used)

---

**Last Updated:** 2024
**Deployment URL:** https://yggdrasilsolution.com/moredansmv








