# Image Color AI Product Plan: AI, Login, Quotas, and Paid Plans

Last updated: 2026-07-05

## Positioning

Image Color AI should stay a fast SEO-first utility. The core value is instant image color picking, HEX/RGB/HSL extraction, and palette generation without friction.

AI should be an enhancement layer, not a blocker for the basic tool.

Core principle:

```text
Free, no-login color picking first.
AI analysis second.
Login and payment only when they protect cost or unlock higher usage.
```

## Product Goals

1. Keep SEO landing experience fast and free.
2. Make the domain name "Image Color AI" true by adding useful AI analysis.
3. Control OpenAI/API cost with login, daily limits, caching, and paid tiers.
4. Avoid uploading user images in v1. Send only color values and generated palette data.
5. Create a path from free users to paid users without hurting the main color picker workflow.

## User Segments

### Casual SEO Visitor

Searches for:

```text
image color picker
color picker from image
pick color from image
hex color picker from image
```

Needs:

```text
Upload image
Click a color
Copy HEX/RGB/HSL
Leave quickly
```

Do not require login for this segment.

### Designer / Frontend User

Searches for:

```text
AI color palette generator
color palette from image
Tailwind color palette from image
brand color palette from image
```

Needs:

```text
Palette names
Mood and style analysis
Brand/design suggestions
CSS variables
Tailwind tokens
Prompt generation
```

This segment can tolerate login after seeing value.

### Power User

Uses the tool repeatedly for client work, UI design, brand systems, screenshots, or content creation.

Needs:

```text
Higher daily/monthly limits
Saved palettes
Export options
No friction
```

This is the paid-plan target.

## Recommended Rollout

### Phase 0: Current Free Tool

Keep these free and no-login:

```text
Image upload
Pixel color picking
HEX/RGB/HSL
Basic palette generation
CSS variables
Screen color picker when browser supports EyeDropper
```

Success criteria:

```text
Visitor can complete color picking in under 10 seconds.
No signup wall before tool usage.
Pages continue ranking for long-tail keywords.
```

### Phase 1: AI Notes Without Image Upload

Add a `Generate AI Notes` button inside the right-side `AI Notes` panel.

Input sent to backend:

```json
{
  "selectedColor": "#0C8F63",
  "rgb": "rgb(12, 143, 99)",
  "hsl": "hsl(160, 85%, 30%)",
  "palette": ["#0C8F63", "#17211D", "#4267D6", "#F2B84B", "#FBFDFB"]
}
```

Do not send:

```text
Original image file
Image URL
Canvas bitmap
User-uploaded binary data
```

AI output:

```json
{
  "paletteName": "Studio Green System",
  "colorMood": "Fresh, calm, organic",
  "bestFor": ["SaaS landing pages", "wellness brands", "editorial UI"],
  "designAdvice": "Use the green as the primary action color and keep dark ink for text contrast.",
  "cssVariables": "--brand: #0C8F63; --ink: #17211D;",
  "tailwindHint": "Use the selected color as brand-500 and the darker shade as brand-900.",
  "prompt": "Design a clean landing page using a fresh green, dark ink, warm amber, and soft white palette."
}
```

UX states:

```text
Default: rule-based local AI-style notes
CTA: Generate AI Notes
Loading: Analyzing palette...
Success: structured AI result
Error: AI notes are unavailable. Try again later.
Cached: previously generated result appears instantly
```

Success criteria:

```text
AI result feels meaningfully better than the local rule-based copy.
No image privacy concern in v1.
AI response returns in under 5 seconds for most users.
```

### Phase 2: Login and Daily Free Quotas

Login method:

```text
Google Sign-In
```

Recommended quota model:

```text
Guest: 3 AI analyses per day
Logged-in free user: 10 AI analyses per day
```

Identity:

```text
Guest quota: anonymous browser ID + IP-level rate limit
Logged-in quota: Google account ID
```

Quota reset:

```text
Daily at 00:00 UTC
```

Quota UI:

```text
3 free AI notes today
Sign in for 10 daily AI notes
You used today's free AI notes
Upgrade for more AI notes
```

Backend storage:

```text
Cloudflare D1 for users and usage logs
Cloudflare KV for short-lived cache and rate limit helpers
```

Success criteria:

```text
No accidental unlimited AI usage.
Users understand why login is useful.
No login required for base color picking.
```

### Phase 3: Paid Plans

Payment provider:

```text
Stripe Checkout
```

Recommended plans:

```text
Free:
  $0
  10 AI analyses/day after login

Pro:
  $9/month
  500 AI analyses/month
  Saved palettes
  Export CSS/Tailwind

Power:
  $19/month
  3000 AI analyses/month
  Batch palette analysis
  Priority generation
```

Upgrade triggers:

```text
After quota exhausted
After user copies AI prompt
After user tries to save palette
On pricing page
```

Do not interrupt:

```text
First upload
First color pick
First HEX copy
```

Success criteria:

```text
Paid upgrade is tied to AI usage and saved workflows, not basic utility usage.
Stripe webhook reliably updates subscription status.
Failed payment downgrades plan safely.
```

## Technical Architecture

Recommended production stack:

```text
Static frontend on Cloudflare Pages
Cloudflare Pages Functions for APIs
Cloudflare D1 for users, quotas, subscriptions
Cloudflare KV for cache and rate limiting
OpenAI API for AI notes
Google Sign-In for auth
Stripe Checkout and webhooks for payment
Turnstile for abuse protection when needed
```

API endpoints:

```text
POST /api/auth/google
GET  /api/auth/me
POST /api/auth/logout
POST /api/analyze-color
GET  /api/usage
POST /api/billing/checkout
POST /api/billing/webhook
```

Minimal D1 tables:

```sql
users(
  id TEXT PRIMARY KEY,
  google_sub TEXT UNIQUE,
  email TEXT,
  name TEXT,
  picture TEXT,
  plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TEXT,
  updated_at TEXT
);

usage_logs(
  id TEXT PRIMARY KEY,
  user_id TEXT,
  anonymous_id TEXT,
  action TEXT,
  usage_date TEXT,
  created_at TEXT
);

subscriptions(
  id TEXT PRIMARY KEY,
  user_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT,
  plan TEXT,
  current_period_end TEXT,
  updated_at TEXT
);
```

AI cache key:

```text
sha256(selectedColor + palette.join(","))
```

Cache policy:

```text
Same selectedColor + same palette returns cached AI result.
Cached AI result should not consume quota.
Cache TTL: 30 days.
```

## Privacy and Trust

Public promise:

```text
Images stay in your browser.
Only selected color values and palette colors are sent for AI analysis.
```

Privacy policy should mention:

```text
Google sign-in account data
AI provider processing selected color values
Cloudflare hosting/logging
Stripe billing data if paid plans launch
```

Avoid in v1:

```text
Uploading original images to AI
Saving uploaded images
Training claims
Unclear tracking
```

## Recommended Next Step

Do not make AI mandatory yet.

Implement next in this order:

1. Add real `Generate AI Notes` API using color values only.
2. Add free quota tracking.
3. Add Google login only when quota tracking is ready.
4. Add Stripe only after usage shows repeated AI demand.

This preserves SEO speed while creating a real path to monetization.
