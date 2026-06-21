# 🎤 MC FABS Masterclass — Event Registration & Ticketing Platform

A **premium full-stack event registration and ticketing platform** for the MC FABS Masterclass hosted by Faith Abah, Kano's premier event host and media personality.

---

## 🌟 Live Features

### ✅ Currently Implemented

| Feature                                              | Status      |
| ---------------------------------------------------- | ----------- |
| Premium Event Landing Page                           | ✅ Complete |
| Hero section with countdown timer                    | ✅ Complete |
| About / Speaker / Schedule / Benefits                | ✅ Complete |
| Testimonials / FAQ / CTA sections                    | ✅ Complete |
| 3-tier ticket pricing display                        | ✅ Complete |
| Full registration form                               | ✅ Complete |
| Form validation (name, email, phone)                 | ✅ Complete |
| Paystack payment integration                         | ✅ Complete |
| Demo payment mode                                    | ✅ Complete |
| Unique ticket code generation (MCFABS-2026-XXX-NNNN) | ✅ Complete |
| Auto seat number assignment (VIP-001, REG-001, etc.) | ✅ Complete |
| QR code generation (qrcode.js)                       | ✅ Complete |
| PDF ticket generation (jsPDF)                        | ✅ Complete |
| Digital ticket view page                             | ✅ Complete |
| PDF ticket download                                  | ✅ Complete |
| WhatsApp ticket sharing                              | ✅ Complete |
| Admin login portal (demo mode)                       | ✅ Complete |
| Admin overview dashboard                             | ✅ Complete |
| Registration stats & revenue cards                   | ✅ Complete |
| Chart.js analytics charts                            | ✅ Complete |
| Attendees management table                           | ✅ Complete |
| Search, filter & sort attendees                      | ✅ Complete |
| CSV export                                           | ✅ Complete |
| Analytics tab (revenue, conversion, fill rate)       | ✅ Complete |
| QR code scanner (html5-qrcode)                       | ✅ Complete |
| Manual check-in entry                                | ✅ Complete |
| Duplicate scan detection                             | ✅ Complete |
| Payment verification on check-in                     | ✅ Complete |
| Supabase schema & RLS policies                       | ✅ Complete |
| Demo mode (in-memory data)                           | ✅ Complete |
| Toast notification system                            | ✅ Complete |
| Responsive mobile-first design                       | ✅ Complete |
| Dark theme with glassmorphism                        | ✅ Complete |
| Gradient text & animations                           | ✅ Complete |
| Countdown timer                                      | ✅ Complete |

---

## 📁 Project Structure

```
mc-fabs-masterclass/
├── index.html                     # Main HTML shell (React CDN)
├── js/
│   ├── config.js                  # Event config, tickets, Paystack key
│   ├── supabase.js                # Supabase client + DB service + Auth
│   ├── utils.js                   # QR gen, PDF gen, Paystack, CSV export
│   ├── toast.js                   # Toast notification system
│   ├── components.js              # Navbar, Footer, Modal, CountdownWidget
│   ├── landing.js                 # Full event landing page
│   ├── register.js                # Registration form + payment + ticket
│   ├── ticket.js                  # Ticket view/download page
│   ├── admin.js                   # Admin dashboard (overview, attendees, analytics)
│   ├── scanner.js                 # QR scanner check-in system
│   └── app.js                     # Main router
├── supabase/
│   ├── schema.sql                 # PostgreSQL database schema + RLS
│   └── edge-function-payment-verify.js # Server-side Paystack verification template
└── README.md
```

---

## 🧪 Local Testing

This app is a static front-end bundle with no build step required. You can test it locally by opening `index.html` in your browser or using a simple local server.

### Recommended local test steps

1. Update `js/config.js` if you want Supabase or Paystack integration:
   - `SUPABASE_URL` and `SUPABASE_ANON_KEY` for Supabase
   - `PAYSTACK_PUBLIC_KEY` for Paystack
   - Leave placeholder values to run in demo mode
2. From the project folder, start a local server for the best browser compatibility:
   - With Python 3: `python -m http.server 8000`
   - Or use VS Code Live Server on `index.html`
3. Open your browser at `http://localhost:8000`
4. Verify the main flows:
   - landing page
   - registration + ticket generation
   - ticket lookup
   - admin login/dashboard
   - QR scanner page

> If your browser blocks local file access, use a local server instead of opening `index.html` directly.

---

## ☁️ Netlify Deployment

This project can be deployed to Netlify as a static site. There is no build command needed.

### Netlify setup

1. Push the repository to GitHub or another Git provider.
2. In Netlify, create a new site and connect your repo.
3. Set the publish directory to `.`
4. Leave the build command blank.
5. Deploy.

### Notes for production

- Netlify only hosts the front-end static files.
- `js/config.js` must be configured with your own Supabase and Paystack values before deployment.
- Supabase and Paystack remain external services.
- For server-side payment verification, deploy `supabase/edge-function-payment-verify.js` separately as a Supabase Edge Function.

---

## 🔗 App Routes (Hash-based Routing)

| URL Hash        | Page            | Description                       |
| --------------- | --------------- | --------------------------------- |
| `/` or `#/`     | Landing Page    | Full event landing page           |
| `#/register`    | Registration    | Multi-step registration + payment |
| `#/ticket`      | Ticket View     | Look up & download ticket         |
| `#/admin/login` | Admin Login     | Secure admin portal login         |
| `#/admin`       | Admin Dashboard | Full management dashboard         |
| `#/scanner`     | QR Scanner      | Event-day check-in scanner        |

---

## ⚙️ Configuration & Setup

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Create a Storage bucket named `tickets` (set to public)
4. Update `js/config.js`:

```js
SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
SUPABASE_ANON_KEY: 'YOUR_ANON_KEY',
```

### 2. Paystack Setup

1. Create an account at [paystack.com](https://paystack.com)
2. Get your **Public Key** from the dashboard
3. Update `js/config.js`:

```js
PAYSTACK_PUBLIC_KEY: 'pk_live_YOUR_PUBLIC_KEY',
```

4. For server-side verification, deploy the Edge Function in `supabase/edge-function-payment-verify.js`

### 3. Admin Credentials

Update in `js/config.js`:

```js
ADMIN_EMAIL: 'admin@mcfabs.ng',
ADMIN_PASSWORD: 'your-secure-password',
```

---

## 🎟️ Ticket Tiers

| Tier           | Price   | Seats | Key Perks                                       |
| -------------- | ------- | ----- | ----------------------------------------------- |
| Regular Access | ₦15,000 | 200   | Full event, materials, lunch, certificate       |
| VIP Access     | ₦35,000 | 50    | + Reserved seating, Meet & Greet, gift pack     |
| Premium Access | ₦75,000 | 10    | + 1-on-1 coaching, pre-event dinner, recordings |

---

## 🗄️ Database Schema

### `attendees` table

| Column              | Type          | Description                 |
| ------------------- | ------------- | --------------------------- |
| `id`                | UUID          | Primary key                 |
| `full_name`         | TEXT          | Attendee's full name        |
| `email`             | TEXT          | Email address               |
| `phone`             | TEXT          | Phone number                |
| `gender`            | TEXT          | Optional gender             |
| `occupation`        | TEXT          | Optional occupation         |
| `ticket_category`   | TEXT          | regular / vip / premium     |
| `ticket_code`       | TEXT (unique) | e.g. MCFABS-2026-VIP-0001   |
| `seat_number`       | TEXT (unique) | e.g. VIP-001                |
| `payment_reference` | TEXT          | Paystack reference          |
| `payment_status`    | TEXT          | pending / paid / failed     |
| `amount_paid`       | NUMERIC       | Amount in NGN               |
| `paid_at`           | TIMESTAMPTZ   | Payment timestamp           |
| `qr_code_url`       | TEXT          | Stored QR code              |
| `ticket_pdf_url`    | TEXT          | Stored PDF URL              |
| `checked_in`        | BOOLEAN       | Check-in status             |
| `checked_in_at`     | TIMESTAMPTZ   | Check-in timestamp          |
| `special_requests`  | TEXT          | Dietary/accessibility notes |
| `created_at`        | TIMESTAMPTZ   | Registration timestamp      |

---

## 🔒 Security Features

- **Supabase Row Level Security (RLS)** enabled on attendees table
- **Server-side payment verification** via Edge Function (prevent frontend spoofing)
- **Duplicate scan prevention** — scanner detects already-checked-in attendees
- **Admin authentication** required for dashboard and scanner access
- **Environment variables** for all sensitive keys
- **No payment confirmation trusted from frontend** alone

---

## 💳 Payment Flow

```
User fills form
    ↓
Attendee record created (status: pending)
    ↓
Paystack popup opens
    ↓
User completes payment
    ↓
[Production] Edge Function verifies with Paystack API
    ↓
Attendee record updated (status: paid)
    ↓
QR code generated
    ↓
PDF ticket generated
    ↓
Confirmation email sent
    ↓
Ticket displayed + available to download
```

---

## 📷 Check-in Flow

```
Staff opens Scanner page
    ↓
Camera activated (html5-qrcode)
    ↓
Attendee shows QR code
    ↓
QR decoded → JSON parsed → ticket_code extracted
    ↓
Database lookup by ticket_code
    ↓
Validation checks:
  ✅ Ticket exists?
  ✅ Payment = 'paid'?
  ✅ Not already checked_in?
    ↓
Update: checked_in = true, checked_in_at = NOW()
    ↓
Display: GREEN = success | YELLOW = duplicate | RED = invalid
```

---

## 🚀 Deployment (Vercel)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy — no build step needed (pure HTML/JS/CDN)

Or use the **Publish tab** above to deploy directly.

---

## 📧 Email System

Currently simulated. To enable real emails:

1. Use **Supabase Edge Functions** + [Resend](https://resend.com) or [SendGrid](https://sendgrid.com)
2. Trigger on payment confirmation
3. Attach PDF ticket as base64 or provide download link

---

## 🔮 Roadmap / Bonus Features

- [ ] Resend/SendGrid email integration for real ticket emails
- [ ] Multi-day event support
- [ ] Waitlist system when sold out
- [ ] Promo code / discount system
- [ ] Stripe payment gateway (secondary)
- [ ] Attendee self-service portal
- [ ] Bulk check-in via CSV
- [ ] SMS notifications (Termii/Twilio)
- [ ] WhatsApp Bot integration
- [ ] Advanced analytics (time-series revenue charts)
- [ ] Multi-event support

---

## 👩 About the Host

**Faith Abah** (MC FABS) is Kano's premier event host and media personality with 10+ years of experience, 500+ events hosted, and a massive following across Northern Nigeria.

📸 Instagram: [@mcfabs.ng](https://instagram.com/mcfabs.ng)
📧 Email: info@mcfabs.ng
📍 Location: Kano, Nigeria

---

_Built with ❤️ for MC FABS Masterclass 2026 | Kano, Nigeria_
