# Telegram WebApp

React + TypeScript + Vite. Built into the existing bot image and served by the
same FastAPI application; no separate frontend service is required on the VPS.

## Development

```sh
npm ci
npm run dev
npm run build
```

Without Telegram init data, the development server displays clearly labelled
sample data and does not create payments. Production requires opening the app
from the Telegram bot. Do not use demo mode to verify actual payment processing.

## Interface

- `#subscription`: current subscription, traffic, key and renewal.
- `#plans`: available plans and prices returned by the bot API.
- `#connect`: subscription link and device setup guide.
- `#profile`: account, refresh, help and persisted light/dark theme.

Checkout uses a multi-page bottom drawer: duration, payment provider, order
confirmation and payment handoff. Back navigation preserves choices. The sheet
uses Base UI for focus management, dismissal, and gestures, and Motion for
measured height and directional content transitions. Reduced-motion users get
short fades without positional transitions. Telegram's back button follows the
drawer steps, then returns to the subscription page.

All prices, discounts, renewal eligibility and gateway choices come from
`/api/v1/public/subscription/offers`. Renewal uses `/subscription/extend`; a new
or replacement plan uses `/subscription/purchase`. Creating a pending payment
is never presented as successful payment. Returning to the app refreshes the
subscription, and the payment screen also offers manual refresh.

Original provider artwork is served locally; sources and attribution are in
[`public/payments/SOURCES.md`](public/payments/SOURCES.md). Unknown providers use
a neutral icon, not another provider's branding.

## Release checks

- Run `npm run build` (TypeScript and production bundling).
- Check all four tabs, copy feedback, theme persistence and nested help/setup.
- Check checkout forward/back, gateway currency and the demo payment handoff.
- Check 320px-wide/short screens, keyboard dismissal and reduced motion.
- Check production without Telegram shows the entry instruction rather than
  sample account data, and protected API routes still reject anonymous access.
- Verify real provider callbacks separately in an authorized sandbox; do not
  create live charges just to test the interface.
