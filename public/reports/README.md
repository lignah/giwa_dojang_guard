# Audit reports (demo)

Short human-readable reports linked from EAS `reportURI`.

| File | Contract (demo) | Score |
|------|-----------------|-------|
| [safe-v1.html](./safe-v1.html) | `0x1111…1111` | 92 Low · Pass |
| [medium-v1.html](./medium-v1.html) | `0x2222…2222` | 78 Medium · Pass |
| [critical-v1.html](./critical-v1.html) | `0x3333…3333` | 34 Critical · Fail |

## How to open (rendered HTML)

Next.js serves these as **`text/html`**:

- Local: `http://localhost:3456/reports/safe-v1.html`
- After Vercel: `https://<your-app>.vercel.app/reports/safe-v1.html`

## Do not use for reportURI

| Host | Problem |
|------|---------|
| `raw.githubusercontent.com` | `Content-Type: text/plain` → browser shows source |
| `cdn.jsdelivr.net/gh/...` | same (`text/plain`) |

Store **`/reports/….html`** (app-relative) on-chain / in demos. The UI rewrites old jsDelivr links to same-origin `/reports/…` automatically.
