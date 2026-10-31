# Tekno Labs — Mobile-First Freelance PWA

Mobile-first Progressive Web App (PWA) for **Tekno Labs** (tekno-labs.com) to track client renewals, sync Google Calendar reminders, manage Manager.io databases, and compile PDF price quotations to Google Drive.

---

## ⚡ Architecture

- **Frontend**: Svelte SPA + Tailwind CSS + PWA (installable on iOS/Android).
- **Hosting**: GitHub Pages (100% serverless static hosting).
- **Backend**: Google Apps Script (GAS) deployed as a Web App API gateway.
- **Database**: Private Google Sheet (`Renewals`, `Services`, `Quotes`, `Setup`, `Audit`).
- **Integrations**: Google Calendar (7-day advance reminders), Google Drive (Quotation PDFs).

---

## 🚀 Quick Setup Guide

### 1. Setup Your Google Sheet Backend (3 minutes)

1. Create a new Google Sheet in your Google account named **Tekno Labs Database**.
2. Open **Extensions > Apps Script**.
3. Replace the code in the editor with the entire contents of [`backend/Code.gs`](./backend/Code.gs).
4. Save the project (Ctrl+S).
5. In the toolbar function dropdown, select **`setup`** and click **Run**.
   - Grant the Google permissions (Sheets, Drive, Calendar).
   - This automatically initializes your sheet tabs (`Renewals`, `Services`, `Quotes`, `Setup`, `Audit`) and creates the `Tekno Labs Quotations` Google Drive folder.
6. In Apps Script, click **Deploy > New deployment**:
   - Type: **Web app**
   - Description: `Tekno Labs API v1`
   - Execute as: **Me (your Google account)**
   - Who has access: **Anyone**
   - Click **Deploy** and copy your **Web app URL** (`https://script.google.com/macros/s/.../exec`).
7. Open the **Setup** tab in your Google Sheet and copy your **Manager key** from cell **B4**.

---

### 2. Connect Your PWA

1. Run the app locally with `npm run dev` or open your deployed GitHub Pages URL.
2. Tap the **Settings** icon on the bottom navigation bar.
3. Paste your **Web App URL** and **Manager Key**.
4. Tap **Test Connection** — once verified, your renewals, catalog, and quotes will sync live!

---

### 3. Deploy to GitHub Pages (2 minutes)

1. Create a new repository on GitHub (e.g. `tekno-labs-suite`).
2. Push this folder to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial Tekno Labs PWA"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings > Pages**.
   - Under **Build and deployment > Source**, choose **GitHub Actions**.
   - The automated workflow [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) will build and deploy your PWA within 60 seconds!

---

### 4. Install on Smartphone

- **iPhone (Safari)**: Open your GitHub Pages URL > Tap **Share** icon > **Add to Home Screen**.
- **Android (Chrome)**: Open your GitHub Pages URL > Tap menu (three dots) > **Install app** or **Add to Home screen**.

---

## 🛠️ Key Features

- **Renewals Tracker**: Track Websites, QR Codes, and Manager.io Databases with visual urgency badges (<7d, <14d, <30d, Expired).
- **Google Calendar Sync**: Adds reminder events with automatic 7-day advance popup and email notifications.
- **Quote Builder**: Select services from your catalog, adjust quantities, and tap **Compile & Save PDF to Drive** to generate branded Tekno Labs PDF quotes.
- **Manager.io Database Tracking**: Track client accounting databases as type `Database` with subscription periods and renewal alerts.
