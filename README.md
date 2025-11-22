# Career Platform Prototype

A lightweight, browser-based career support tool designed to help students with resume improvement, career advising, and interview practice.
Includes login, 2-factor verification, real AI responses from Hugging Face, and a local saved-responses system stored in the browser.

This prototype is intended for demonstration and coursework purposes only — not for production use.

---

## Features

### 1. Login + Two-Factor Verification

* Simple email/password mock login
* 6-digit code generated on the client
* Unlocks access to all tools

### 2. AI-Powered Tools (HuggingFace)

Your backend calls a Hugging Face model using a secure server-side request:

* **Resume Bullet Feedback**
* **Career Advisor Guidance**
* **Interview Question Generator**

The server communicates with:

```
https://router.huggingface.co/hf-inference/models/google/gemma-2b-it
```

### 3. Saved Responses (LocalStorage)

Each AI output can be saved, shown in the “Saved Responses” tab, and deleted.
No backend database required.

---

## Project Structure

```
career-platform/
│
├── index.html        # UI for login, 2FA, and tools
├── styles.css        # Basic styling
├── app.js            # Front-end logic + tabs + saved responses
├── server.js         # Node/Express backend that calls HuggingFace
│
├── package.json
├── package-lock.json
└── .gitignore
```

---

## Requirements

* **Node.js 18+** (required because it includes global `fetch`)
* A **Hugging Face API key**
* Any modern browser

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure HuggingFace API key

**Do NOT hardcode your key in the repo.**

Set it in your terminal before starting the server:

#### Windows (PowerShell)

```powershell
setx HF_API_KEY "hf_your_real_key_here"
```

Then restart your terminal.

#### macOS/Linux

```bash
export HF_API_KEY="hf_your_real_key_here"
```

The backend automatically reads:

```js
const HF_API_KEY = process.env.HF_API_KEY || "YOUR_HF_TOKEN_HERE";
```

---

## Running the Prototype

### 1. Start the backend server

```bash
node server.js
```

You should see:

```
AI backend running on http://localhost:3000
```

### 2. Open the front-end

Open `index.html` directly in your browser, or serve it via any local HTTP server.

The front end communicates with:

```
POST http://localhost:3000/api/ai
```

---

## Security Notes

* This is a **prototype**, not a production system.
* No passwords are stored.
* 2FA is simulated entirely on the client.
* HuggingFace key must stay **only in environment variables**, never committed to GitHub.
* Saved responses are stored solely in the user’s **localStorage**.

---

## Future Improvements (Suggested)

* Replace mock login with real authentication (OAuth / JWT)
* Add a backend database (SQLite, Postgres, or Supabase) for real persistence
* Improve UI styling + layout
* Support multiple models or user-selectable AI engines
* Add rate-limiting and input validation for production safety

---

## License

This project is for academic and demonstration purposes only.

---
