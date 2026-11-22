# Updating rivalrymetrics.com on the VPS

How to put the latest code from GitHub live on the VPS.

This guide assumes the usual Next.js setup: an Ubuntu VPS running the app with
**PM2** behind **Nginx**, in `/var/www/rivalarymatrix`. If your server uses a
different folder or process name, swap yours in.

---

## Quick update (the server is already set up)

Run these after a branch has been merged to `main` on GitHub:

```bash
ssh your-user@your-vps-ip

cd /var/www/rivalarymatrix
git fetch origin
git checkout main
git pull origin main

npm ci                # install exact versions from package-lock.json
npm run build         # must end without errors

pm2 restart rivalrymetrics
pm2 logs rivalrymetrics --lines 30   # check it started cleanly (Ctrl+C to exit)
```

Then go to [Check the live site](#check-the-live-site).

### Deploying a branch before it's merged

To try a branch such as `aamodupdate` before merging it:

```bash
cd /var/www/rivalarymatrix
git fetch origin
git checkout aamodupdate
git pull origin aamodupdate
npm ci && npm run build && pm2 restart rivalrymetrics
```

Switch back afterwards with `git checkout main && git pull`, then build and
restart again.

---

## First-time server setup

Only needed once, on a fresh VPS.

### 1. Install Node.js (version 20.9 or newer), Git and PM2

Next.js 16 refuses to run on older Node versions.

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
sudo npm install -g pm2
node -v    # should print v22.x
```

### 2. Clone the repository

```bash
sudo mkdir -p /var/www && sudo chown $USER /var/www
cd /var/www
git clone https://github.com/higsfieldai870-hub/rivalarymatrix.git rivalarymatrix
cd rivalarymatrix
```

The repo is private, so Git asks for a username and password. Use your GitHub
username and a **Personal Access Token** as the password: GitHub → Settings →
Developer settings → Personal access tokens, with `repo` access. To avoid
typing it every time, add a deploy key over SSH instead.

### 3. Create the environment file

`.env*` files are git-ignored, so create this one on the server by hand:

```bash
nano /var/www/rivalarymatrix/.env.production
```

```ini
# Required: the BSD (sports.bzzoiro.com) API token. Without it the site still
# works, but comparisons show no stats and the sitemap lists only 4 pages.
STATS_A_KEY=your_bsd_api_token

# The public address, used for canonical URLs, the sitemap and robots.txt.
NEXT_PUBLIC_SITE_URL=https://rivalrymetrics.com

# Optional: only set this to point at a different API host.
# STATS_A_BASE_URL=https://sports.bzzoiro.com/api/v2
```

> Build **after** creating or changing this file. `NEXT_PUBLIC_SITE_URL` is
> baked in at build time, and pages like `/rivalries` and `/sitemap.xml` are
> pre-rendered during the build using `STATS_A_KEY`.

### 4. Build and start with PM2

```bash
npm ci
npm run build
pm2 start npm --name rivalrymetrics -- start -- -p 3000
pm2 save
pm2 startup     # run the command it prints, so the app comes back after a reboot
```

### 5. Point Nginx at the app

```bash
sudo nano /etc/nginx/sites-available/rivalrymetrics
```

```nginx
server {
    listen 80;
    server_name rivalrymetrics.com www.rivalrymetrics.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/rivalrymetrics /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 6. Turn on HTTPS

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d rivalrymetrics.com -d www.rivalrymetrics.com
```

### 7. Redirect the old haalandvsmbappe subdomain

The site started on `haalandvsmbappe.rivalrymetrics.com`, and Google still
remembers those URLs. Keep the subdomain alive only to send visitors and
Google to the main site with a permanent (301) redirect, so its history
passes to the new pages instead of ending in "site not found".

1. At your DNS provider, add an **A record**: name `haalandvsmbappe`, value
   `187.127.181.25` (the same IP as `rivalrymetrics.com`).
2. Add a second server block to the Nginx file:

   ```bash
   sudo nano /etc/nginx/sites-available/rivalrymetrics
   ```

   ```nginx
   server {
       listen 80;
       server_name haalandvsmbappe.rivalrymetrics.com;

       # The old home page was the Haaland vs Mbappé comparison.
       location = / {
           return 301 https://rivalrymetrics.com/compare/erling-haaland-vs-kylian-mbappe;
       }
       # Anything else: same path on the main site.
       location / {
           return 301 https://rivalrymetrics.com$request_uri;
       }
   }
   ```

3. Once the DNS record works (`ping haalandvsmbappe.rivalrymetrics.com` shows
   the IP), add HTTPS for it and reload:

   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d haalandvsmbappe.rivalrymetrics.com
   ```

   When certbot asks, choose **redirect**. Certbot copies the `return 301`
   lines into the HTTPS block it creates. Check the result with
   `curl -I https://haalandvsmbappe.rivalrymetrics.com/`: expect `301` and
   `location: https://rivalrymetrics.com/compare/erling-haaland-vs-kylian-mbappe`.

Don't delete the record or this block later: the redirect has to stay up for
Google to keep passing the old URLs' history on.

---

## Check the live site

```bash
curl -I https://rivalrymetrics.com/rivalries        # expect HTTP 200
curl -s https://rivalrymetrics.com/robots.txt
curl -s https://rivalrymetrics.com/sitemap.xml | grep -c "<url>"
```

- The sitemap should list well over 4 URLs. If it lists only 4, `STATS_A_KEY` is
  missing or wrong: fix `.env.production`, then build and restart again.
- Open https://rivalrymetrics.com/rivalries in a browser. The rivalry cards
  should show player photos.

### After an SEO change: tell Google

1. In Google Search Console → **Sitemaps**, resubmit
   `https://rivalrymetrics.com/sitemap.xml`.
2. In **URL Inspection**, enter `https://rivalrymetrics.com/rivalries`, click
   **Test live URL** to confirm the content shows, then click **Request
   Indexing**.

---

## If something goes wrong

| Problem | Fix |
| --- | --- |
| `npm run build` fails | Read the error. The live site keeps running the previous build until you restart, so nothing has broken yet. |
| Site down after restart | `pm2 logs rivalrymetrics --lines 100`. Check the Node version with `node -v` (needs 20.9+). |
| 502 Bad Gateway | The app isn't running. Check `pm2 status`, then `pm2 restart rivalrymetrics`. |
| `git pull` refuses: local changes | Someone edited files on the server. `git stash` (or `git checkout -- .` to throw them away), then pull again. |
| Changes don't appear | Make sure you ran `npm run build` **and** `pm2 restart`. Hard-refresh the browser (Ctrl+Shift+R). |

### Roll back to the previous version

```bash
cd /var/www/rivalarymatrix
git log --oneline -5             # find the last good commit
git checkout <commit-hash>
npm ci && npm run build && pm2 restart rivalrymetrics
```

Once it's fixed on GitHub, go back with `git checkout main && git pull`, then
build and restart.
