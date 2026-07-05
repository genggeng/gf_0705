# Image Color AI SEO Site

Static launch package for an AI-assisted image color picker.

## Pages

- `/` targets `AI image color picker`, `image color picker`, `color picker from image`.
- `/ai-color-palette-generator.html` targets `AI color palette generator from image`.
- `/color-palette-from-image.html` targets `color palette from image`.
- `/pick-color-from-image.html` targets `pick color from image`.
- `/hex-color-picker-from-image.html` targets `HEX color picker from image`.
- `/tailwind-color-palette-generator.html` targets `Tailwind color palette generator from image`.
- `/privacy.html` is the production Privacy Policy page.

## Deploy

This is a plain static site. Deploy the folder to Cloudflare Pages, GitHub Pages, Vercel, or any static host.

Production domain is `https://imagecolorai.com`.

## Google Login

The site includes Google login for Cloudflare Pages.

1. Create a Google OAuth Web Client in Google Cloud Console.
2. Add authorized JavaScript origins:
   - `https://imagecolorai.com`
   - `https://www.imagecolorai.com` if the www host remains enabled
3. Put the client id into `config.js`:
   - `window.IMAGE_COLOR_AI_GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";`
4. Add Cloudflare Pages environment variables:
   - `GOOGLE_CLIENT_ID`
   - `SESSION_SECRET`

`SESSION_SECRET` should be a long random string. The login API sets an HttpOnly signed session cookie.
