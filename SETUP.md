# EasyTrust Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account
- SMTP email provider

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Database setup
```bash
npx prisma db push
# or for production migrations:
npx prisma migrate deploy
```

### 4. Create attorney account
After starting the app, register with your attorney email, then update your role in the database:
```sql
UPDATE "User" SET role = 'ATTORNEY' WHERE email = 'your@email.com';
```

### 5. Run development server
```bash
npm run dev
```

Visit http://localhost:3000

---

## Production Deployment

### Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Random 32-char secret (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — Your production URL
- `STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `ATTORNEY_NAME`, `ATTORNEY_BAR_NUMBER`, `ATTORNEY_FIRM`, `ATTORNEY_ADDRESS`, `ATTORNEY_PHONE`, `ATTORNEY_EMAIL`
- `NEXT_PUBLIC_ATTORNEY_NAME`, `NEXT_PUBLIC_ATTORNEY_BAR`, `NEXT_PUBLIC_FIRM_NAME` (for client-side display)

### Stripe Webhook
Set your Stripe webhook endpoint to: `https://yourdomain.com/api/payment/webhook`
Events: `checkout.session.completed`

### Uploads Directory
Set `UPLOADS_DIR` to a persistent writable directory for generated PDFs.
For cloud deployments, replace the file system storage with AWS S3 or similar.

---

## Workflow Overview

| Status | Description |
|--------|-------------|
| ACCOUNT_CREATED | Client registered |
| PAYMENT_PENDING | Redirected to Stripe |
| PAYMENT_COMPLETE | Payment confirmed |
| QUESTIONNAIRE_IN_PROGRESS | Client filling out intake |
| QUESTIONNAIRE_COMPLETE | Intake submitted |
| DOCUMENTS_GENERATING | PDF generation in progress |
| DOCUMENTS_GENERATED | PDFs ready for attorney review |
| ATTORNEY_REVIEW | Attorney reviewing |
| CHANGES_REQUESTED | Attorney requested clarification |
| ATTORNEY_APPROVED | Documents approved |
| SENT_TO_CLIENT | Package mailed to client |
| AWAITING_NOTARIZED_DOCS | Waiting for notarized return |
| DOCS_RECEIVED | Notarized docs arrived |
| DOCS_SCANNED | Documents scanned |
| DOCS_UPLOADED | Uploaded to client Dropbox |
| BINDER_MAILED | Bound originals mailed back |
| COMPLETE | Process complete |

---

## Document Package
Each client receives:
1. **Revocable Living Trust** — Avoids probate, manages asset distribution
2. **Durable Power of Attorney** — Financial agent during incapacity
3. **Advance Health Care Directive** — Healthcare wishes + agent
4. **HIPAA Authorization** — Medical information access
5. **Pour-Over Will** — Captures assets not in trust
6. **Certificate of Trust** — Proof of trust without revealing terms
