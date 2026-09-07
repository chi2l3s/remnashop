# HUTEP VPN cabinet

Web / Telegram Mini App on the existing Remnashop public API. Custom Material 3
Expressive-inspired CSS, no MUI or claim of an official Google web implementation.
Design reference: https://m3.material.io/blog/building-with-m3-expressive

## Local launch

Requires Node 22+ and the configured Remnashop backend (PostgreSQL, Redis,
Remnawave and server-side bot credentials). From `cabinet`:

```powershell
npm ci
$env:CABINET_API_TARGET = 'http://127.0.0.1:5000'
npm run dev
```

Open http://127.0.0.1:5173/cabinet/. The proxy keeps API calls on the same origin.
Without a backend, the client displays a server error and sign-in form. There are
no fake subscriptions or development authentication bypasses. Never put bot
tokens, JWT secrets, or API keys in frontend variables.

## Serve from the bot

Run `npm run build` before starting FastAPI. Production Dockerfile builds the
client automatically. With `WEB_ENABLED=true`, FastAPI serves `/cabinet/`.
Set `WEB_CABINET_URL=https://YOUR_BOT_DOMAIN/cabinet/` to use the existing WebApp
button in the bot. Existing `APP_API_KEY` and `APP_JWT_SECRET` must be configured
server-side as required by AppConfig. Retain HTTPS and secure HttpOnly cookies.
Telegram sends `initData` to the existing `/auth/telegram/webapp` validator;
client-provided Telegram user fields are never used for authorization.

When a Telegram account has no local subscription, `/subscription/current` looks
up Remnawave by the authenticated account's Telegram ID and imports a single
matching subscription using the existing synchronization service. Multiple
matches, mismatched Telegram IDs, and subscriptions owned by another local
account are rejected. Configure `REMNAWAVE_HOST` and `REMNAWAVE_TOKEN` on the
backend; the panel must have the user's `telegramId` populated. Existing local
subscriptions retain their billing plan. Imported plans may need a matching
shop tariff before renewal is available.

The local Docker compose mounts `src`, so build on the host before starting it.
Telegram requires a reachable HTTPS URL; a localhost preview alone cannot open
the real Mini App on a phone. Use your configured test HTTPS deployment for that.

## Features

- Telegram automatic login; existing email login and registration; refresh/logout.
- Current subscription, expiry, real usage, copy subscription URL and connection page.
- Real offers, renewal/purchase confirmation, payment URL and manual status refresh.
- List/remove devices, remove all devices, regenerate subscription with confirmation.
- Promo codes, free/paid trials, referral code/stats, email verification.

The API's verified-email requirements and Telegram Stars restrictions are retained.
Payment succeeds only when the backend payment webhook processes it; returning
from a payment page never marks a subscription paid. Prices come from the server.

## Validation

```powershell
npm test
npm run build
npx playwright test tests/cabinet.spec.js --workers=1
```

The browser suite requires the dev server. API fixtures exist only in the test
browser and are not included in the shipped client. They do not constitute a
live integration test against a real bot or payment provider.
