Edau Server — Payments (Lipia / MPesa) Integration

This document explains environment variables and endpoints for the Lipia (MPesa) STK Push integration.

Environment

- `LIPIA_API_KEY` — Your Lipia API key (Bearer token). Required for initiating STK Push requests.

Callback URL

- The Lipia provider will POST payment updates (webhooks) to the callback URL you provide when initiating an STK Push.
- Example production callback URL for this project: `https://edau.loopnet.tech/api/payments/lipia/callback`

Endpoints implemented

- `POST /api/payments/stk-push`
  - Body: `{ phone_number, amount, external_reference?, callback_url?, metadata? }`
  - Initiates an STK push via Lipia API and persists the attempt in `payments` collection.

- `POST /api/payments/lipia/callback`
  - Receives provider callbacks, saves raw payload to `payment_callbacks`, and attempts to correlate/update the `payments` record.

Receipts & Admin

- When a payment callback is successful the server will now attempt to:
  - Mark the related `orders` record as `paid` (if `order_id` / external reference is available).
  - Create a `receipts` document with transaction details and link it to the order via `receipt_id`.

- Admin endpoints:
  - `GET /api/admin/orders` (admin only) — paginated list of all orders
  - `PATCH /api/admin/orders/:id/status` (admin only) — update order status and optionally create a receipt
  - `GET /api/receipts` (admin only) — paginated list of receipts
  - `GET /api/receipts/:id` (admin only) — fetch a single receipt

Notes

- Ensure `LIPIA_API_KEY` is set in your environment (or in your container/hosting config).
- The callback handler is intentionally forgiving about payload shape and will save raw JSON for auditing.
- You may extend validation or signature verification as provided by Lipia if they document a webhook signature header.
