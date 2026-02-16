# Real Focus Image – Photography Studio Website

A full-stack photography studio site with **Node.js** backend and **React** frontend, matching the CLASSIC STUDIO–style design (dark theme, gold accents). Includes packages, booking, and an **admin image upload** for advertising your real image company.

## Features

- **Home**: Hero (“Capture Your Beautiful Moments”), package list by category (Events & Corporate, Studio Shoot, Wedding)
- **Packages**: Graduation, Birthday Party, Quick Shot, Basic/Premium Portrait, Wedding Basic/Standard/Premium with prices in RWF
- **Book Now**: Form with package select, name, email, WhatsApp, date/time, notes, total, and Preview & Confirm
- **Gallery**: Public page showing advertising images (view only for visitors)
- **Admin**: **Studio owner only** – password-protected. Only the owner can upload new images or remove images. Visitors cannot upload or delete.

## Tech Stack

- **Backend**: Node.js, Express, Multer (file upload), JSON file storage
- **Frontend**: React, Vite, React Router, CSS modules

## Run the project

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set ADMIN_PASSWORD to a secret password (studio owner only).
npm install
npm run dev
```

Server runs at **http://localhost:5000**.

### Admin password – when and how

**When:** You create the admin password **when you first set up the backend** (before or right after you run the server).

**How:**

1. In the `backend` folder, create a file named `.env` (copy from `.env.example` if you prefer):
   - Windows (Command Prompt): `copy .env.example .env`
   - Windows (PowerShell) / Mac / Linux: `cp .env.example .env`
2. Open `.env` in a text editor.
3. Find the line `ADMIN_PASSWORD=your-secret-password`.
4. Replace `your-secret-password` with **a password you choose** (e.g. `MyStudio2026!` or any strong password). Save the file.
5. Restart the backend if it was already running.

**Using it:** Go to **http://localhost:3000/admin** and log in with the same password you put in `.env`. Only you (the studio owner) should know this password. There is no “sign up” page – you define the password once in `.env` and use it to log in to Admin whenever you need to upload or remove gallery images.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:3000** and proxies `/api` and `/uploads` to the backend.

### 3. Use the app

- **Home**: http://localhost:3000  
- **Book**: http://localhost:3000/book  
- **Gallery**: http://localhost:3000/gallery  
- **Admin (studio owner only)**: http://localhost:3000/admin – requires password. Only the owner can upload or remove gallery images.

Visitors see the Gallery as view-only. The owner logs in at Admin with the password set in `ADMIN_PASSWORD` to upload or remove advertising images.

**Changing the password (no developer needed):** Once logged in at `/admin`, the studio owner can click **“Change password”**, enter their current password and a new one, and save. The new password is stored on the server; they are then logged out and must sign in again with the new password. No need to edit `.env` or restart the server.

## API (backend)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/packages | List all packages |
| GET | /api/packages/:id | Get one package |
| GET | /api/bookings | List bookings |
| POST | /api/bookings | Create booking (packageId, name, date required) |
| GET | /api/gallery | List gallery images |
| POST | /api/admin/verify | Verify studio owner password (body: `{ "password": "..." }`) |
| POST | /api/admin/change-password | Change password (body: `{ "currentPassword": "...", "newPassword": "..." }`) – owner only |
| POST | /api/upload | Upload image – **requires header `X-Admin-Password`** (owner only) |
| DELETE | /api/gallery/:id | Delete gallery image – **requires header `X-Admin-Password`** (owner only) |

Uploaded files are stored in `backend/uploads/` and metadata in `backend/data/gallery.json`.
