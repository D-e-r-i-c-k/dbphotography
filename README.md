# Photography Website

A professional photography website for showcasing work, listing events, selling photos, and delivering high-quality images to clients. Built for South Africa with ZAR payments, protected previews, and secure full-resolution downloads.

## Tech stack

- **Frontend:** Next.js (React), Tailwind CSS, shadcn/ui
- **Content:** Sanity (headless CMS)
- **Images:** Sanity native uploads for hero/event content, Cloudinary for gallery collections and delivery
- **Payments:** PayFast (ZAR) or Stripe
- **Forms:** Formspree
- **Hosting:** Vercel

## Prerequisites

- Node.js 18+
- npm or pnpm
- Sanity account
- PayFast or Stripe merchant account (for photo sales)

## Setup

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd portfolio
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and fill in values. See [Environment variables](#environment-variables) below.

3. **Run development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

4. **Build for production**

   ```bash
   npm run build
   npm start
   ```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID (public) |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset (e.g. `production`) |
| `SANITY_API_READ_TOKEN` | Optional: token for server-side or private content |
| `PAYFAST_MERCHANT_ID` | PayFast merchant ID (payments) |
| `PAYFAST_MERCHANT_KEY` | PayFast merchant key (keep secret) |
| `PAYFAST_PASSPHRASE` | PayFast passphrase if set |
| `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | Formspree form ID for contact form |
| `SANITY_API_WRITE_TOKEN` | Required for Cloudinary to Sanity gallery sync |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for gallery image delivery |
| `CLOUDINARY_CLOUD_NAME` | Server fallback for Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Required for Cloudinary folder listing and sync |
| `CLOUDINARY_API_SECRET` | Required for Cloudinary folder listing and sync |
| `SYNC_SECRET` | Recommended for protecting deployed sync endpoints |

See `.env.example` for a full list with placeholders.

## Sanity Studio (content management)

Schemas: **Event**, **Gallery** (with sellable images and prices), **Site configuration** (hero, featured gallery).

- **Hero image** and **event cover images** are uploaded directly in Sanity Studio.
- **Gallery covers** and **gallery photo collections** are driven from Cloudinary folders via sync.

1. Create a project at [sanity.io](https://sanity.io) and copy the **Project ID**.
2. In the repo root, copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SANITY_PROJECT_ID` (and `NEXT_PUBLIC_SANITY_DATASET` if needed).
3. From the repo root, run the Studio:  
   `cd sanity && npm install && npm run dev`  
   Open [http://localhost:3333](http://localhost:3333). If you run from `sanity/`, create `sanity/.env` with the same variables (or copy from root).
4. In the Studio, add **Site configuration** (singleton), then **Events** and **Galleries**.
5. Use `/admin/cloudinary-sync` locally to create or update galleries from Cloudinary folders. If `SYNC_SECRET` is enabled in a deployed environment, call the sync endpoints with the `x-sync-secret` header instead of relying on the browser UI.

## Project structure

- `app/` – Next.js App Router pages and layouts
- `components/` – React components
- `lib/` – utilities (e.g. `cn`, Sanity client)
- `sanity/` – Sanity Studio and schemas (Event, Gallery, Site config)
- `public/` – Static assets

## Deploy

- **Vercel:** Connect this repo to Vercel; set environment variables in the dashboard. Each push to `main` deploys.
- Ensure `NEXT_PUBLIC_*` and server-side env vars are set in the Vercel project.

## License

MIT – see [LICENSE](LICENSE).
