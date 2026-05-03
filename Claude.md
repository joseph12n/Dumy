# Dumy — Project Context

## Overview

**Name:** Dumy
**Concept:** Local-first financial mobile app with offline AI.
**Mission:** Help users manage finances through OCR (receipts) and an intelligent chatbot for financial insights — all on-device, no internet required.
**Target:** Youth/Students in Colombia looking for a clean, private, trustworthy financial tool.
**Status:** Backend 100% | Mobile UI 100% | AI + OCR Functional | Design 2.0 Complete | Savings System Complete | EAS Deploy Ready

## Tech Stack

| Layer      | Technology                                                 |
| ---------- | ---------------------------------------------------------- |
| Frontend   | React Native (Expo SDK 54) + NativeWind (TailwindCSS)      |
| State      | Zustand v5 + TypeScript strict                             |
| Database   | SQLite (expo-sqlite v16, local-only)                       |
| AI Engine  | Smart Financial Engine (offline) + ExecuTorch ready        |
| OCR        | Google ML Kit (@react-native-ml-kit/text-recognition)      |
| Camera     | expo-camera v17 + expo-image-picker v17                    |
| Animations | react-native-reanimated v4 (fade-in, spring, counters)     |
| Gradients  | expo-linear-gradient (hero cards, buttons, tab bar)        |
| Haptics    | expo-haptics (tactile feedback on interactions)            |
| Backend    | Optional Node.js gateway (Ollama/fallback) for online mode |
| Build      | EAS Build (development + preview + production profiles)    |

## Architecture Rules

- **On-Device First:** Always prefer local processing over cloud APIs. Privacy is non-negotiable.
- **Modular Structure:** Code in `src/` (components, hooks, store, api, utils, theme).
- **Atomic Design:** UI components small, reusable, logic-free when possible.
- **No direct store access from components** — always use custom hooks.
- **Single financial entrypoint:** financial UI reads from `useFinancialSystem` and compatibility hooks (`useTransactions`, `useCategories`, `useStats`) now act as facades.
- **TypeScript strict** — no `any` types, 0 compile errors.
- **Conventional Commits** (feat, fix, docs, chore, refactor).

## Project Structure

```
dumy/
├── src/                        # Business logic (no React views)
│   ├── store/                  # Zustand stores + SQLite layer
│   │   ├── types.ts            # Domain types (25+ interfaces incl. OCR)
│   │   ├── database.ts         # SQLite singleton
│   │   ├── migrations.ts       # Schema versioned with seed data
│   │   ├── *Store.ts           # 6 Zustand stores (incl. savingsStore)
│   │   ├── repositories/       # Pure SQL CRUD (5 repos incl. savingsRepository)
│   │   └── AppDatabaseProvider.tsx
│   ├── api/                    # AI / chatbot layer
│   │   ├── ai/
│   │   │   ├── types.ts        # AI provider contracts (with vision support)
│   │   │   ├── catalog.ts      # Model catalog (Smart Engine + ExecuTorch + Online)
│   │   │   ├── router.ts       # Selects local/online provider per context
│   │   │   ├── runtime.ts      # Reads EXPO_PUBLIC_AI_* env vars
│   │   │   ├── ocrEngine.ts    # ML Kit text recognition wrapper
│   │   │   ├── receiptParser.ts        # Colombian receipt data extractor
│   │   │   ├── smartFinancialEngine.ts # Offline intelligent analysis engine
│   │   │   ├── index.ts
│   │   │   └── providers/
│   │   │       ├── localProvider.ts    # Smart Engine + ExecuTorch (offline)
│   │   │       └── onlineProvider.ts   # HTTP backend (Ollama/fallback)
│   │   ├── llmBridge.ts        # Compatibility bridge to AI router
│   │   ├── promptTemplates.ts  # System prompt + Llama 3.2 format
│   │   └── chatContextBuilder.ts # Financial context injection
│   ├── components/
│   │   ├── common/             # CandyCard, CandyButton, BrandHeader, EmptyState, IconBadge
│   │   ├── animated/           # FadeInView, ScalePress, AnimatedNumber, StaggeredList
│   │   └── finance/            # MiniBarChart, ProgressRing, SpendingTimeline, WeeklySummaryCard
│   ├── hooks/                  # Custom hooks (7, includes useSavings + unified financial hook)
│   ├── utils/                  # Utilities (currency, dates, stats, uuid)
│   └── theme/                  # Design tokens + runtime personalization (gradients, shadows)
├── app/                        # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx           # Dashboard
│   │   ├── history.tsx         # Transaction history
│   │   ├── add.tsx             # Add transaction
│   │   ├── chat.tsx            # AI chat (with image attachment)
│   │   ├── scan.tsx            # Receipt scanner (camera + OCR + parser)
│   │   ├── profile.tsx         # Settings + personalization
│   │   └── _layout.tsx         # Tab navigation
│   ├── modal.tsx               # Category management
│   └── _layout.tsx             # Root layout + theme provider
├── backend/                    # Optional Node AI gateway
│   ├── server.js               # /health + /ai/chat endpoints
│   └── .env.example
├── .env.example                # Expo env config
└── CONTEXT.md                  # This file
```

## Database Schema

| Table                   | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `categories`            | Transaction categories (9 defaults + custom) |
| `transactions`          | Income/expense records (COP integers)        |
| `budgets`               | Spending limits per category/period          |
| `chat_messages`         | Conversation history by session              |
| `user_settings`         | Key-value config + schema_version            |
| `savings_goals`         | Target-based savings goals with progress     |
| `savings_contributions` | Individual deposits toward a savings goal    |

**Conventions:** Money = integer COP (no cents) | Dates = ISO 8601 | Migrations = versioned in user_settings

## AI Architecture

### Execution Flow

```
User message (+ optional image)
    ↓
chatStore.sendMessage(text, imageUri?)
    ↓
[If image] → ocrEngine.recognizeText(uri) → receiptParser.parseReceipt(text)
    ↓
chatContextBuilder.buildChatContext() → financial context from live stores
    ↓
llmBridge.setContext(financialContext, receiptData?)
    ↓
llmBridge.generateResponse(prompt)
    ↓
aiRouter.selectProvider(options)
    ↓
┌──────────────────────┬──────────────────────┐
│  LOCAL (offline)     │  ONLINE (optional)   │
│                      │                      │
│  1. ExecuTorch LLM   │  HTTP POST to        │
│     (if model loaded)│  backend/server.js   │
│  2. Smart Financial  │  → Ollama or         │
│     Engine (always)  │    fallback           │
└──────────────────────┴──────────────────────┘
    ↓
Response → chatRepository → SQLite → UI
```

### Smart Financial Engine (Primary Offline AI)

Located in `src/api/ai/smartFinancialEngine.ts`. Not a generic LLM — a purpose-built engine that:

- Classifies user intent (spending, categories, budget, savings, receipts, trends, greetings)
- Pulls real data from the user's financial context (including savings goals)
- Computes actual numbers (averages, percentages, projections, savings timelines)
- Generates natural language responses in Colombian Spanish
- Analyses scanned receipts with line-item breakdowns and comparisons to monthly spend

### OCR Pipeline

Located in `src/api/ai/ocrEngine.ts` and `src/api/ai/receiptParser.ts`.

1. **Capture:** expo-camera (photo) or expo-image-picker (gallery)
2. **Recognition:** @react-native-ml-kit/text-recognition (on-device, no network)
3. **Parsing:** Custom Colombian receipt parser
   - Detects COP values ($150.000 format, dot = thousands separator)
   - Identifies TOTAL, SUBTOTAL, IVA labels
   - Extracts vendor name and date
   - Sums line items automatically
4. **Output:** Structured `ReceiptData` with items, totals, confidence score

**Requires native build** (EAS Build). Gracefully degrades in Expo Go with error messaging.

### ExecuTorch Integration (Enhancement)

Architecture is ready in `localProvider.ts`. When a .pte model file is available:

- `react-native-executorch` native module loads the model
- `tryExecuTorchGeneration()` handles inference
- Falls back to Smart Financial Engine if model not loaded

### Online Backend (Optional)

`backend/server.js` provides a Node gateway:

- `AI_BACKEND_PROVIDER=ollama` → forwards to local Ollama instance
- `AI_BACKEND_PROVIDER=fallback` → contextual fallback responses
- `EXPO_PUBLIC_AI_MODE=online` forces online-only on the app side
- `EXPO_PUBLIC_AI_MODE=hybrid` (default) uses local first

## Data Flow

```
User Input (React Component)
    ↓
Custom Hook (useFinancialSystem/useChat, etc.)
    ↓
Zustand Store (get/set operations)
    ↓
Repository Layer (SQL CRUD)
    ↓
SQLite Database (dumy.db, on-device)
```

## Financial System Architecture (Restructured)

The financial system now has a single, explicit orchestration layer in `src/hooks/useFinancialSystem.ts`.

### Why this restructure

- Previous logic was split between multiple hooks + `statsStore`, making the read path harder to follow.
- Derived metrics (monthly stats, trends, budget status, recent transactions) are now computed from one place.
- Existing screen-level APIs remain stable through compatibility facades.

### New read path

```
Screen (dashboard/history/add)
    ↓
useFinancialSystem(period?)
    ↓
Base stores: transactionStore + categoryStore
    ↓
Pure derivations: statistics utils (period summary, breakdown, trends, budget status)
    ↓
UI-ready state: totals, alerts, lists, actions
```

### Hook roles after restructure

- `useFinancialSystem`: single source of truth for financial read models and actions.
- `useTransactions`: compatibility facade over `useFinancialSystem`.
- `useCategories`: compatibility facade over `useFinancialSystem`.
- `useStats`: compatibility facade over `useFinancialSystem`.
- `transactionStore` / `categoryStore`: persistence + CRUD only.
- `statsStore`: retained for backward compatibility, no longer required by main financial screens.

## Design System 2.0 — "Vibrant Depth"

- **Direction:** Premium fintech (Nubank, Revolut, Cash App inspired)
- **Gradients:** Hero cards use `primary → secondary` gradient. Tab bar center button is gradient.
- **Glass Cards:** Semi-transparent white (rgba 0.75) with subtle borders and colored shadows.
- **Animations:**
  - `FadeInView` — fade-in + slide-up on mount (staggered delays)
  - `ScalePress` — spring-physics scale bounce on press with haptic feedback
  - `AnimatedNumber` — smooth counting animation for financial values
  - `StaggeredList` — children animate in sequence with configurable delay
- **Shadows:** Tinted shadows matching element color (pink for CTAs, purple for cards)
- **Haptics:** Light impact on button press via expo-haptics
- **Local Context:** Bogota-based, COP currency, Colombian financial terminology
- **Runtime Design:** Users customize via unified presets in Profile
  - Visual presets, accent color, density, corner radius, font scale
  - Gradient configs and shadow configs auto-derived from palette
  - All screens consume `resolveRuntimeDesign(settings)` for consistency
  - Presets defined in `src/theme/designRuntime.ts`
- **Stitch Project:** "Finanzas Personales Kawaii" (ID: 4458879260444914570) with design system "Dumy 2.0 — Premium Fintech"

## Screens

| Screen    | Route       | Features                                                                          |
| --------- | ----------- | --------------------------------------------------------------------------------- |
| Dashboard | `/` (index) | Balance, income/expense, weekly summary, top categories, recent tx, quick actions |
| History   | `/history`  | Filterable transaction list with inline edit/delete per transaction               |
| Add       | `/add`      | Transaction form with category selection, receipt upload, scan pre-fill           |
| Chat      | `/chat`     | AI assistant with text + image attachment, savings-aware context                  |
| Scan      | `/scan`     | Camera/gallery capture → OCR → receipt parsing → results → add-as-expense        |
| Savings   | `/savings`  | Goals CRUD, contributions, progress rings, completion tracking                    |
| Profile   | `/profile`  | Name, avatar, data management (reset transactions/chat/savings), full app reset  |
| Modal     | `/modal`    | Category management (CRUD)                                                        |

## Build & Deploy

- **Dev:** `npm start` (Expo Go for basic testing, dev-client for native features)
- **Dev-client build:** `eas build --platform android --profile development` (includes native modules)
- **Preview APK:** `eas build --platform android --profile preview`
- **Production:** `eas build --platform android --profile production`
- **APK release:** GitHub Actions → Build Android APK → release tag
- **Config:** `app.json` includes plugins for expo-router, expo-sqlite, expo-camera, expo-image-picker

## Key Decisions

1. **Smart Financial Engine over generic LLM** — Purpose-built analysis with real data beats a 1B-param model hallucinating about finances. Zero download, instant response.
2. **ML Kit for OCR** — On-device, fast, accurate for printed text. No cloud API needed.
3. **ExecuTorch ready but deferred** — Architecture prepared. Model download (~1.3GB) is optional enhancement, not requirement.
4. **Zustand over Redux** — Lightweight, performant, less boilerplate.
5. **SQLite local-only** — No server dependency. 100% offline functional.
6. **Graceful degradation** — Native modules (OCR, camera) fail gracefully in Expo Go with clear messaging.
7. **Design 2.0 with Reanimated** — Spring physics, fade-in mounts, animated counters, staggered lists. All using react-native-reanimated for 60fps native driver animations.
8. **Gradient hero cards** — expo-linear-gradient for premium fintech feel on hero elements, tab bar, and CTAs.

## Module Completion

| Module                              | Status             | Completion |
| ----------------------------------- | ------------------ | ---------- |
| Backend (stores, repos, hooks)      | Done               | 100%       |
| Mobile UI (all screens)             | Done               | 100%       |
| AI Smart Engine (offline chat)      | Done (11 skills)   | 100%       |
| Savings System (goals + contrib.)   | Done               | 100%       |
| Data Management (reset/delete)      | Done               | 100%       |
| Dashboard Components (4 charts)     | Done               | 100%       |
| OCR + Receipt Parser                | Done               | 100%       |
| Camera Integration                  | Done               | 100%       |
| Chat + Image + Savings Context      | Done               | 100%       |
| Scan → Add Pre-fill Flow            | Done               | 100%       |
| ExecuTorch LLM                      | Architecture ready | 30%        |
| Online Backend (Ollama)             | Done               | 100%       |
| Runtime Personalization             | Done               | 100%       |
| Design 2.0 (Animations + Gradients) | Done               | 100%       |
| Animated Components (4 primitives)  | Done               | 100%       |
| TypeScript Compilation              | Clean              | 0 errors   |
| EAS Build + Deploy                  | Ready (3 profiles) | 80%        |

## Continuity Rules

- Any meaningful change must update this `CONTEXT.md` before finishing.
- Keep notes short, factual, current so the next session can resume without rediscovery.
- This is the single source of truth for project context.
