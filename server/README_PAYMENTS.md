Edau Server — Payments (Lipia / MPesa) Integration

This document explains environment variables and endpoints for the Lipia (MPesa) STK Push integration.

Environment

- `LIPIA_API_KEY` — Your Lipia API key (Bearer token). Required for initiating STK Push requests.

Callback URL

- The Lipia provider will POST payment updates (webhooks) to the callback URL you provide when initiating an STK Push. IMPORTANT: the callback must target your backend (API) host, not the frontend.
- Example production callback URL for this project (backend): `https://edau.onrender.com/api/payments/lipia/callback`

- Note: Lipia expects your callback endpoint to respond quickly with plain-text `ok` (HTTP 200, Content-Type: text/plain) to acknowledge receipt. The server implementation does this by returning `ok` for successful handling.

Endpoints implemented

- `POST /api/payments/stk-push`
  - Body: `{ phone_number, amount, external_reference?, callback_url?, metadata? }`
  - Initiates an STK push via Lipia API and persists the attempt in `payments` collection.

  - Note on phone format: The server expects Kenyan phone numbers in MSISDN format `2547XXXXXXXX` (12 digits).
    Common inputs supported and normalized:
    - `07XXXXXXXX` -> `2547XXXXXXXX`
    - `7XXXXXXXX` -> `2547XXXXXXXX`
    - `+2547XXXXXXXX` -> `2547XXXXXXXX`
    If a phone cannot be normalized into a 12-digit Kenyan MSISDN the endpoint will return HTTP 400.

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
 
 Hosts / Deployment notes

- Frontend (deployed on Vercel): `https://edau.loopnet.tech`
- Backend API (deployed on Render): `https://edau.onrender.com`

- In production the frontend is configured to proxy `/api/*` requests to the backend via `vercel.json` rewrites. This means the frontend can keep calling relative paths like `/api/payments/stk-push` and Vercel will forward them to `https://edau.onrender.com/api/...`.
- Alternatively, the frontend can call the backend absolute URL. If you do that, set `VITE_API_URL=https://edau.onrender.com` in your frontend environment.
