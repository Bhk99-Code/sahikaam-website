# SahiKaam Website — Live karne ki poori guide

Ye website Next.js mein bani hai. Iske 3 hisse hain, aur teeno ka free plan hai:

| Kaam | Service | Kharcha |
|---|---|---|
| Login, database, PDF storage | **Supabase** | Free plan |
| Payment (UPI, card, net banking) | **Razorpay** | Har payment par ~2% fee |
| Website hosting | **Vercel** | Free plan |

Kul time: **1–2 ghante**. Razorpay ka KYC approve hone mein 2–5 din lag sakte hain. Tab tak **Test mode** mein sab check kar sakte ho.

---

## Step 0 — Policy pages mein apni details bharo (zaroori)

`lib/business.ts` file kholo aur ye placeholders apni details se bharo:

- `[BUSINESS LEGAL NAME]`: proprietor ka naam ya registered company
- `[FULL ADDRESS…]`
- `[CONTACT PHONE]`

`app/terms/page.tsx` mein `[CITY]` bhi bharo.

> Razorpay activation ke waqt website par **Contact, Terms, Privacy, Refund aur Delivery policy** pages check karta hai. Ye paanchon pages already bane hue hain.

---

## Step 1 — Supabase setup (15 min)

1. https://supabase.com par sign up karo, phir **New project** banao. Region: **Mumbai (ap-south-1)**.
2. **SQL Editor** kholo, `supabase/schema.sql` ka poora text paste karo, aur **Run** dabao.
3. Usi tarah `supabase/seed.sql` bhi run karo. Isse 2 starter books aur `LAUNCH20` coupon ban jayenge.
4. **Storage** mein `books` bucket mein apni ebook PDFs upload karo. File ka naam wahi hona chahiye jo `file_path` mein likha hai (jaise `manufacturing-50.pdf`).
5. Login code ke liye email template badlo: **Authentication › Email Templates › Magic Link**. Body mein `{{ .Token }}` add karo, jaise:
   ```
   <h2>SahiKaam login code</h2>
   <p>Aapka code hai: <b>{{ .Token }}</b></p>
   ```
6. **Authentication › URL Configuration**:
   - Site URL: `https://aapka-domain.com`
   - Redirect URLs mein ye add karo: `https://aapka-domain.com/auth/callback`
7. **Project Settings › API** se teen cheezein copy karo: Project URL, `anon` key, aur `service_role` key.

> Supabase ka free email service ek ghante mein sirf kuch emails bhejta hai. Launch se pehle **Authentication › SMTP Settings** mein Brevo, Resend ya Zoho jaisa SMTP jod lo.

---

## Step 2 — Razorpay setup (10 min + KYC)

1. https://razorpay.com par sign up karo aur KYC complete karo (PAN, bank account, business details, website URL).
2. Dashboard ko **Test Mode** mein rakho. Phir **Account & Settings › API Keys › Generate Key** se Key ID aur Key Secret copy karo.
3. **Webhooks** setup karo (ye website live hone ke baad karna hai, Step 3 ke baad):
   - **Account & Settings › Webhooks › Add New Webhook**
   - URL: `https://aapka-domain.com/api/webhooks/razorpay`
   - Secret: koi bhi lamba password khud bana lo. Yahi `RAZORPAY_WEBHOOK_SECRET` mein daalna hai.
   - Events: `payment.captured` aur `order.paid`

> Webhook isliye zaroori hai: agar customer payment ke turant baad tab band kar de, tab bhi book uski Library mein aa jayegi.

---

## Step 3 — Vercel par live karo (10 min)

1. Ye folder GitHub par ek **private** repo mein upload karo.
2. https://vercel.com par jao: **Add New › Project** aur wo repo choose karo.
3. **Environment Variables** mein `.env.example` ki saari values daalo:

```
NEXT_PUBLIC_SITE_URL=https://aapka-domain.com
NEXT_PUBLIC_SUPPORT_EMAIL=team@sahikaam.com
NEXT_PUBLIC_SUPPORT_WHATSAPP=91XXXXXXXXXX
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

4. **Deploy** dabao.
5. **Settings › Domains** mein `sahikaam.com` jodo, aur Vercel jo DNS records bataye wo apne domain provider par daalo.

> `SUPABASE_SERVICE_ROLE_KEY` aur `RAZORPAY_KEY_SECRET` kabhi kisi ko mat bhejna, aur code mein bhi mat likhna.

---

## Step 4 — Test karo (Test mode mein)

1. Website kholo, login karo, aur koi book par **Buy Now** dabao.
2. Razorpay test payment ke liye UPI ID `success@razorpay` daalo, ya Razorpay docs ka test card use karo.
3. Payment ke baad aap seedha **My Library** par pahunchoge. Wahan "Padhna Shuru Karein" dabao aur check karo ki book reader mein khulti hai.
4. Supabase **Table Editor** mein `orders` table dekho. Order ka status `paid` hona chahiye.
5. Coupon `LAUNCH20` daal kar bhi ek baar test karo.

Sab theek ho to Razorpay mein **Live Mode** ki keys banao, Vercel par `rzp_live_...` keys daalo, Redeploy karo, aur Live mode ke liye webhook dobara add karo.

---

## Roz ka kaam: naya book ya course kaise daalein

Koi coding nahi chahiye. Sab Supabase **Table Editor › products** se hota hai.

| Column | Kya daalein |
|---|---|
| `slug` | URL ka naam, jaise `food-processing-20` (sirf small letters aur `-`) |
| `type` | `ebook`, `course` ya `bundle` |
| `title`, `subtitle`, `description` | Book ki details |
| `price` | Rupees mein, jaise `999`. `0` daaloge to book free ho jayegi |
| `mrp` | (optional) kati hui keemat, jaise `1999` |
| `cover_color` | Cover ka rang, jaise `#C2410C`. Ya `cover_url` mein asli cover image ka link daalo |
| `file_path` | Storage `books` bucket mein PDF ka naam |
| `chapters` | `["Chapter 1", "Chapter 2"]` |
| `highlights` | `[{"title":"50","text":"Business ideas"}]` |
| `lessons` (course) | `[{"title":"Intro","video_url":"https://youtu.be/...","minutes":10}]` |
| `bundle_items` | Jo products saath mein FREE milne chahiye, unke slugs, jaise `["legal-business-andha-paisa"]` |
| `is_published` | `false` karoge to product chhup jayega |
| `sort_order` | Chhota number = upar dikhega |

**₹4,999 ebook ke saath ₹1,999 course free dena hai?** Course ko `type = course` ke saath ek product banao. Phir manufacturing ebook ki `bundle_items` mein us course ka slug daal do. Ebook kharidte hi course bhi Library mein aa jayega.

**Naya coupon:** `coupons` table mein row add karo:
- `code`: CAPITAL letters mein, jaise `DIWALI30`
- discount: `percent_off` ya `flat_off` mein se ek
- (optional) `max_uses`, `expires_at`, ya `product_slug` (sirf ek product ke liye)

**Video courses:** YouTube "Unlisted", Vimeo ya Bunny Stream ka link chalega. Paid course ke liye **Bunny Stream ya Vimeo** behtar hai, kyunki unlisted YouTube link aage share ho sakta hai.

---

## Book chori se kaise bachti hai

- PDF private storage mein rehti hai. Sirf kharidne wale ko 10 minute ka temporary link milta hai.
- Download button nahi hai, aur right-click aur print band hain.
- Har page par kharidne wale ka masked email aur ID watermark mein dikhta hai. Leak hua to pata chal jayega kisne kiya.
- Koi bhi website screenshot ko 100% nahi rok sakti. Watermark isi liye hai.

---

## Files ka naksha

```
app/                 saare pages
  page.tsx           Home
  books/             Catalog + search
  book/[slug]/       Book detail
  checkout/[slug]/   Checkout + coupon + Razorpay
  login/             Email OTP login
  library/           My Library
  read/[slug]/       Secure PDF reader
  learn/[slug]/      Course video player
  help/              Help Center
  terms, privacy, refund-policy, delivery-policy, contact
  api/checkout/      order banana + payment verify
  api/webhooks/razorpay/   payment backup confirmation
lib/business.ts      ✏️ apni business details yahan
supabase/            database setup SQL
```

Local computer par chalana ho to: `npm install`, phir `.env.example` ko copy karke `.env.local` banao aur values bharo, phir `npm run dev` chalao aur http://localhost:3000 kholo.
