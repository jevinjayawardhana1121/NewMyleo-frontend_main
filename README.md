# MYLEO Portal — Leo Multiple District 306

Modern online administration and reporting portal for Leo Clubs in Leo Multiple District 306, Sri Lanka & Maldives.

---

## ⚡ Tech Stack

- **Runtime & Package Manager**: [Bun](https://bun.com/)
- **Frontend Framework**: [React 18](https://react.dev/) + TypeScript
- **UI Components & Primitives**: [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS
- **Compiler**: [React Compiler](https://react.dev/learn/react-compiler) (`babel-plugin-react-compiler` + `react-compiler-runtime`)
- **Linter**: [OXC](https://oxc.rs/) (`oxlint`)
- **Animation Engine**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Reporting & Ledger Engine**: PDF generation via `pdfmake`, client-side image optimization via `compress.js`, real-time WebSockets via `laravel-echo` + `pusher-js`.

---

## 🔑 Sample Login Credentials

For testing and demonstration, use the following credentials on the login screen:

| Field | Sample Credential |
| :--- | :--- |
| **Email Address** | `jevinjayawardhana1121@gmail.com` |
| **Password** | `Jevin@2001` |

> *Tip*: The login page has an **Autofill** button on the credentials badge that instantly loads these details.

---

## 🚀 Getting Started with Bun

### 1. Installation
Install project dependencies with Bun:
```bash
bun install
```

### 2. Local Development Server
Start the development server on `http://localhost:3000`:
```bash
bun run dev
```

### 3. Linting with OXC (`oxlint`)
Run fast linting across all files:
```bash
bun run lint
```
To run autofixes:
```bash
bun run lint:fix
```

### 4. Production Build
Compile and bundle optimized assets using Vite and React Compiler:
```bash
bun run build
```

Preview the production build:
```bash
bun run preview
```

---

## 🏛️ Project Structure

```text
myleo_frontend-main/
├── dist/                  # Production build output
├── public/                # Static assets (logos, favicon, welcome images)
├── src/
│   ├── assets/            # Fonts (vfs_fonts.js for pdfmake) and images
│   ├── components/
│   │   ├── layout/        # AppLayout, Sidebar, Navbar
│   │   └── ui/            # shadcn/ui components (button, card, dialog, tabs, badge, etc.)
│   ├── lib/
│   │   ├── api.ts         # Authenticated API client & response handlers
│   │   ├── bookkeeper.ts  # Double-entry accounting engine & PDF report generator
│   │   ├── broadcast.ts   # Laravel Echo / Pusher WebSockets
│   │   ├── cookie.ts      # Browser cookie helpers
│   │   ├── env.ts         # API endpoints & environment constants
│   │   ├── imageCompressor.ts # Client-side image compressor
│   │   └── utils.ts       # Utility functions & class merger
│   ├── pages/
│   │   ├── auth/          # Login screen
│   │   ├── dashboard/     # Search results & discovery
│   │   ├── membership/    # Members list, add member, Leo profile
│   │   ├── projects/      # 6-step project wizard, views, approvals, audit logs
│   │   ├── reports/       # 6-step activity reports, financial & membership review
│   │   ├── settings/      # User profile, Club profile, District & MD settings, Categories
│   │   ├── wallet/        # Club wallet, ledger transactions, double-entry validation
│   │   ├── About.tsx      # Heritage & background of MYLEO
│   │   └── 404.tsx        # Not found view
│   ├── store/             # Zustand stores (userStore, projectStore, reportStore, walletStore, appStore)
│   ├── App.tsx            # Protected & public routing
│   ├── index.css          # Tailwind CSS styles & Leo palette
│   └── main.tsx           # React DOM root entry
├── .oxlintrc.json         # OXC lint configuration
├── package.json           # Scripts & dependencies
├── tailwind.config.js     # Leo brand colors, typography, border radiuses
└── vite.config.ts         # Vite configuration with React Compiler plugin & manual chunks
```

---

## 🎨 Color Palette (Leo MD 306)

- **Leo Brand Blue**: `#4091e2`
- **Dark Charcoal**: `#212529`
- **Gold Accent**: `#ffc107`
- **Canvas Background**: `#f3f4f8`
- **Success Green**: `#198754`
- **Danger Red**: `#dc3545`

---

## ⚖️ Financial & Reporting Integrity

The accounting engine in `src/lib/bookkeeper.ts` strictly preserves all double-entry formulas:
- Exact 29-element financial ledger calculations
- Verification: `total_assets === total_liabilities`
- Receipts & Payments (R&P) and Income & Expenditure (I&E) balance calculations
- 6-step project reporting and 4-tier approval state machine (`0: Draft`, `1: Rejected`, `2: Pending`, `3: Approved`)
