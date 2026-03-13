# Guide: Running Multiple React Apps on Same Server

When you have 2 React apps in different folders, they need to be configured separately to avoid conflicts.

## Common Issues with Multiple React Apps

1. **Conflicting homepage paths** - Both apps using same `homepage` in package.json
2. **Asset path conflicts** - One app loading assets from the wrong path
3. **Route conflicts** - Both apps interfering with each other's routing
4. **.htaccess conflicts** - Apache rewrite rules conflicting
5. **Environment variable conflicts** - Same env vars affecting both apps

## Solution: Separate Configuration for Each App

### Step 1: Identify Your Two Apps

Determine where each app is deployed:
- **App 1:** `https://yggdrasilsolution.com/[folder1]/`
- **App 2:** `https://yggdrasilsolution.com/[folder2]/`

Example:
- App 1 (POS): `https://yggdrasilsolution.com/moredansmv/`
- App 2 (Other): `https://yggdrasilsolution.com/other-app/`

### Step 2: Configure Each App Separately

Each app needs its own configuration:

#### For App 1 (moredansmv):
```json
// frontend/package.json
{
  "homepage": "https://yggdrasilsolution.com/moredansmv"
}
```

```env
// frontend/.env
REACT_APP_HOMEPAGE=https://yggdrasilsolution.com/moredansmv
REACT_APP_API_BASE_URL=https://yggdrasilsolution.com/backend_pos
```

```apache
# frontend/public/.htaccess
RewriteBase /moredansmv/
RewriteRule . /moredansmv/index.html [L]
```

#### For App 2 (other-app):
```json
// other-app/package.json
{
  "homepage": "https://yggdrasilsolution.com/other-app"
}
```

```env
// other-app/.env
REACT_APP_HOMEPAGE=https://yggdrasilsolution.com/other-app
REACT_APP_API_BASE_URL=https://yggdrasilsolution.com/other-backend
```

```apache
# other-app/public/.htaccess
RewriteBase /other-app/
RewriteRule . /other-app/index.html [L]
```

### Step 3: Build Each App Separately

```bash
# Build App 1
cd frontend
npm run build

# Build App 2
cd ../other-app
npm run build
```

### Step 4: Verify Build Outputs

**Check App 1 build:**
- `frontend/build/index.html` - Should reference `/moredansmv/static/...`
- `frontend/build/.htaccess` - Should have `RewriteBase /moredansmv/`

**Check App 2 build:**
- `other-app/build/index.html` - Should reference `/other-app/static/...`
- `other-app/build/.htaccess` - Should have `RewriteBase /other-app/`

## Troubleshooting

### Issue 1: One App Loads Assets from Wrong Path

**Symptom:** App shows 404 for CSS/JS files

**Solution:**
1. Check `homepage` in each app's `package.json` - must match deployment folder
2. Check `.env` file - `REACT_APP_HOMEPAGE` must be set correctly
3. Rebuild the app: `npm run build`

### Issue 2: Routes Not Working

**Symptom:** 404 when refreshing or direct access to routes

**Solution:**
1. Each app needs its own `.htaccess` file
2. `.htaccess` `RewriteBase` must match the deployment folder
3. Verify `.htaccess` is in the build folder

### Issue 3: Both Apps Interfering

**Symptom:** Navigation between apps breaks, or one app's routes affect the other

**Solution:**
1. Ensure each app has its own `basename` in React Router
2. Check `App.js` uses `REACT_APP_HOMEPAGE` correctly
3. Verify environment variables are different for each app

### Issue 4: API Calls Going to Wrong Backend

**Symptom:** One app calls the other app's API

**Solution:**
1. Set `REACT_APP_API_BASE_URL` in each app's `.env`
2. Each app should have different API endpoints
3. Rebuild both apps after changing `.env`

## Best Practices

### ✅ DO:
- Use separate `.env` files for each app
- Use different `homepage` values in `package.json`
- Keep separate build folders
- Use distinct basenames in React Router
- Have separate `.htaccess` files with correct `RewriteBase`

### ❌ DON'T:
- Share the same `homepage` between apps
- Use the same build folder
- Share `.env` files between apps
- Have conflicting `RewriteBase` in `.htaccess`

## Quick Checklist for Each App

For EACH React app, verify:

- [ ] `package.json` has correct `homepage`
- [ ] `.env` file has `REACT_APP_HOMEPAGE` matching deployment folder
- [ ] `.env` file has `REACT_APP_API_BASE_URL` pointing to correct backend
- [ ] `public/.htaccess` has correct `RewriteBase /folder-name/`
- [ ] `App.js` uses `REACT_APP_HOMEPAGE` for basename
- [ ] Build outputs reference correct paths (check `build/index.html`)
- [ ] Build is uploaded to correct server folder

## Example Structure

```
server/
├── public_html/
│   ├── moredansmv/          (App 1 - POS)
│   │   ├── index.html
│   │   ├── .htaccess        (RewriteBase /moredansmv/)
│   │   └── static/
│   │       ├── css/
│   │       └── js/
│   │
│   └── other-app/           (App 2 - Other)
│       ├── index.html
│       ├── .htaccess        (RewriteBase /other-app/)
│       └── static/
│           ├── css/
│           └── js/
```

## Still Having Issues?

If both apps still don't work:

1. **Check browser console (F12):**
   - Look for 404 errors on assets
   - Check Network tab for failed requests

2. **Verify server folder structure:**
   - Each app must be in its own folder
   - No overlapping paths

3. **Test one app at a time:**
   - Deploy App 1, test it works
   - Then deploy App 2, test it works
   - If one breaks, check its configuration

4. **Check for caching:**
   - Clear browser cache
   - Try incognito/private browsing
   - Hard refresh (Ctrl+F5)

---

**Need Help?** Describe:
- What are the two folder names?
- What specific errors are you seeing?
- What happens when you visit each app's URL?








