# Server Configuration for React Router (Fix 404 on Refresh)

When you refresh the page on routes like `/moredansmv/dashboard`, you get a 404 error because the server tries to find a physical file at that path. The server needs to be configured to serve `index.html` for all routes.

## Quick Fix Options

### Option 1: Apache Server (.htaccess) ✅ RECOMMENDED

If you're using Apache (most cPanel/hosting providers):

1. **Before building:** The `.htaccess` file is already in `frontend/public/`
   - It will be copied to `build/` during `npm run build`

2. **After building:** Verify the `.htaccess` file exists in `frontend/build/`

3. **If the file is missing:** Create `frontend/build/.htaccess` with this content:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /moredansmv/
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule ^index\.html$ - [L]
     RewriteRule . /moredansmv/index.html [L]
   </IfModule>
   ```

4. **Upload:** Make sure `.htaccess` is uploaded to `/moredansmv/` on your server

### Option 2: Nginx Configuration

If you have access to Nginx configuration:

```nginx
location /moredansmv {
  alias /path/to/your/build;
  try_files $uri $uri/ /moredansmv/index.html;
  
  # Cache static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### Option 3: cPanel File Manager (Manual Fix)

1. Log into cPanel
2. Open **File Manager**
3. Navigate to `public_html/moredansmv/`
4. Create a new file named `.htaccess` (note the dot at the start)
5. Paste the Apache configuration above
6. Save the file

### Option 4: Verify with Your Hosting Provider

If `.htaccess` files are disabled or not working:

1. Contact your hosting provider
2. Ask them to enable `mod_rewrite` for Apache
3. Or ask them to configure URL rewriting for `/moredansmv/*` routes

## Testing

After configuring:

1. ✅ Visit: `https://yggdrasilsolution.com/moredansmv/`
   - Should load the app

2. ✅ Navigate to: `https://yggdrasilsolution.com/moredansmv/dashboard`
   - Should load dashboard

3. ✅ **Refresh the page (F5)** on `/dashboard`
   - Should NOT show 404 error
   - Should stay on the dashboard page

4. ✅ Test direct access: Type `https://yggdrasilsolution.com/moredansmv/dashboard` in a new browser tab
   - Should load directly without 404

## Troubleshooting

### Still Getting 404?

1. **Check file exists:**
   - Verify `.htaccess` is in `/moredansmv/` directory on server
   - File name must be exactly `.htaccess` (with leading dot)

2. **Check mod_rewrite is enabled:**
   - Some hosts disable `mod_rewrite`
   - Contact support if needed

3. **Check RewriteBase path:**
   - Must match your deployment path: `/moredansmv/`
   - If deployed at root (`/`), change to: `RewriteBase /`

4. **Check file permissions:**
   - `.htaccess` should be readable (644 permissions)

5. **Check server error logs:**
   - Look in cPanel → Error Logs
   - May show why rewrite isn't working

### Alternative: Use HashRouter (Not Recommended)

If you can't configure the server, you can switch to HashRouter (URLs will have `#`):
```javascript
import { HashRouter as Router } from 'react-router-dom';
```
This doesn't require server configuration but URLs look like: `/moredansmv/#/dashboard`

---

## Files Location

- Configuration file: `frontend/public/.htaccess` (before build)
- After build: `frontend/build/.htaccess` (upload this to server)

Make sure `.htaccess` is uploaded with your build files!








