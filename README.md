# 🚲 Rajeshwari Cycles — Shop Management System
### Ramachandrapuram

Full-stack cycle shop management web app built with React + Supabase, deployed on Vercel.

---

## 📁 All Files in This Project

```
rajeshwari-cycles/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Layout.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── Inventory.js
│   │   ├── AddProduct.js
│   │   ├── Sales.js
│   │   ├── CreateInvoice.js
│   │   ├── Dealers.js
│   │   ├── Purchases.js
│   │   ├── Payments.js
│   │   └── Reports.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── supabase_schema.sql
├── vercel.json
├── package.json
├── .gitignore
└── .env.example
```

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### STEP 1 — Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) → Sign up / Log in
2. Click **"New Project"** → Choose a name and strong password
3. Select region: **South Asia (Mumbai)** → Click **Create**
4. Wait ~2 minutes for project to be ready
5. Go to **SQL Editor** (left sidebar) → Click **New Query**
6. Open `supabase_schema.sql` → Copy ALL the content → Paste → Click **Run**
7. You will see "Success" message

### STEP 2 — Create Admin User

1. In Supabase → Go to **Authentication** (left sidebar)
2. Click **Users** → Click **"Add user"** → **"Create new user"**
3. Enter your Email and Password → Click **Create User**
4. This email + password is what you use to log in to your website

### STEP 3 — Get Supabase Keys

1. In Supabase → Go to **Project Settings** (gear icon)
2. Click **API** tab
3. Copy **Project URL** (looks like: https://xxxxxxxxxxxx.supabase.co)
4. Copy **anon public** key (long string starting with eyJ...)
5. Keep these safe — you need them in next steps

### STEP 4 — Upload Code to GitHub

1. Go to [github.com](https://github.com) → Sign up / Log in
2. Click **"New repository"** (green button)
3. Name it: `rajeshwari-cycles`
4. Set to **Public** → Click **Create repository**
5. On your computer, open terminal in the project folder and run:

```bash
git init
git add .
git commit -m "Rajeshwari Cycles - initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/rajeshwari-cycles.git
git push -u origin main
```

### STEP 5 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New Project"**
3. Find and select your `rajeshwari-cycles` repository → Click **Import**
4. BEFORE clicking Deploy → scroll down to **"Environment Variables"**
5. Add these two variables:

| Name | Value |
|------|-------|
| `REACT_APP_SUPABASE_URL` | Your Supabase Project URL from Step 3 |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anon key from Step 3 |

6. Click **Deploy** → Wait 2-3 minutes
7. Your website is LIVE! ✅

---

## 💳 UPI Payment Flow

1. Go to **Payments** page
2. Click **Pay** next to a dealer
3. Enter the amount
4. Click **Google Pay** / **PhonePe** / **UPI Pay** → Opens payment app on your phone
5. Complete the payment
6. Come back to website → Click **Mark as Paid**
7. Balance updates automatically ✅

---

## 🛠 Tech Stack

- **Frontend**: React 18
- **Routing**: React Router v6
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Charts**: Recharts
- **Hosting**: Vercel

---

## 📞 Shop Info

**Rajeshwari Cycles, Ramachandrapuram**
