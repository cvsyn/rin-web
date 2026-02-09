# RIN API Landing Page

Static landing page for the RIN API. Designed for Cloudflare Pages, no build step required.

## Deploy to Cloudflare Pages

1. Push this `rin-web` folder to a GitHub repo.
2. In Cloudflare Dashboard, go to **Pages** and select **Create a project**.
3. Choose **Connect to Git** and select the GitHub repo.
4. Configure build settings:
   - Build command: **None**
   - Output directory: **/**
5. Deploy the project.

## Custom Domain (Cloudflare-managed)

1. In the Pages project, go to **Custom domains** and add `cvsyn.com`.
2. Confirm the DNS changes suggested by Cloudflare.
3. Make sure `api.cvsyn.com` continues to point to the API server (do not route it to Pages).

## Optional Redirects

If you later need redirects, add a `_redirects` file in the repo root. Example:

```
/docs   /#quickstart   301
```

## Notes

- This site is fully static: `index.html`, `styles.css`, `main.js`.
- No build step is required for deployment.
