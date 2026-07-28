# Talent Crafters — Career Development

Marketing site for Talent Crafters Career Development packages:

- Graduate Package
- Professional Package
- Executive Package
- International Resume

Lead capture via enquiry form (email through Resend) and WhatsApp. No login or client portal in v1.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS 4
- Resend for enquiry emails
- Zod for request validation

## Setup

1. Copy env template:

```bash
cp .env.example .env.local
```

2. Set `CONTACT_EMAIL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, and optionally `RESEND_API_KEY`.

3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without `RESEND_API_KEY`, form submissions succeed and are logged to the server console (useful in local development).
