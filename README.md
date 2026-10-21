# 🎉 Dombon Khnom — Frontend UI

> A community event discovery platform built with Next.js. Users can explore events on an interactive map, share activities, and connect with organizers across Cambodia.

🔗 Live site: https://dombonknhom.kshrd.app/
---

## 📋 Table of Contents

- [Overview](#overview)
- [Demo](#demo)
- [Screenshots](#screenshots)
- [Features](#features)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Connection](#api-connection)
- [Production Build](#production-build)
- [Test Accounts](#test-accounts)
- [Flow Diagrams](#flow-diagrams)
- [Contributors](#contributors)

---

## Overview

**Dombon Khnom** is a web application for discovering and sharing local events in Cambodia. It supports four roles — User, Organizer, Moderator, and Admin — each with their own tailored dashboard and feature set.

---

## 🌐 Demo

> 🔗 Live site: https://dombonknhom.kshrd.app/

<!-- Once deployed, replace with your actual URL -->
<!-- [https://dombon-khnom.vercel.app](https://dombon-khnom.vercel.app) -->

---

## 📸 Screenshots

> Screenshots will be added once the UI is finalized.

<!-- Uncomment and replace paths once you have screenshots -->
<!--
| Home (Map View) | Discovery Feed | Organizer Dashboard |
|---|---|---|
| ![Map View](./screenshots/home-map.png) | ![Discovery](./screenshots/discovery.png) | ![Dashboard](./screenshots/dashboard.png) |

| Moderator Dashboard | Admin Dashboard |
|---|---|
| ![Moderator](./screenshots/moderator.png) | ![Admin](./screenshots/admin.png) |
-->

---

## Features

### 🗺️ Home — Map View & List View
- **Map View**: Displays all upcoming and today's events on an interactive map. Click on a pin to preview event details.
- **List View**: Browse event cards with like, share, and favorite actions. Filter by category (Sport, Education, etc.), location (Province, District, Commune), and date. Switch between All Events, Today, and Upcoming.

### 🔍 Discovery
- **Feed**: Search for users or organizers by name. View and interact with activity posts (like, share, favorite, report). Share to social platforms (Facebook, Instagram, Messenger). Post your own activity linked to an event — upload up to 10 images or 1 video, add tags, dependencies, and location.
- **Gallery**: Browse all activity images and videos in a grid layout.

### 📅 Event Management
- **Users** can create events; submissions require moderator approval before going public.
- **Organizers** can create events that are published immediately.

### 📸 Activity Management
- Users and organizers can post activities that are published immediately.

### 🏢 Organizer Dashboard
- KPI cards: Total Events, Rating, Favorites, Earnings
- Monthly likes and attendee charts
- Upcoming events and Top 5 Events
- Event management table
- Wallet: earnings chart, current balance, recent transactions
- Profile editing and account settings (including account deletion)

### 🛡️ Moderator Dashboard
- KPI cards: Total Organizers, Reports, Events
- Activity overview pie chart
- Organization upgrade requests and reported events
- Event Submissions: review, approve, or reject user-submitted events
- Report Management: view and handle reported events and activities
- Organization Requests: approve or reject user requests to become an organizer

### ⚙️ System Admin Dashboard
- KPI cards: Total Events, Users, Favorites, Earnings
- Recent Users table (all roles)
- Category Management: create, update, delete, and search categories
- Report Management: handle reported events and activities
- User Management: view, delete users/organizers/moderators; create moderator accounts
- Transactions: view payment records
- Withdrawal Requests: KPI summary + table for pending/approved/rejected requests

### 🔔 Notifications
- Payment tracking
- Likes and comments alerts
- Event approval / rejection notices
- Organizer upgrade request updates

### 👤 Profiles

**Organizer Profile**
- Cover photo, full name, follower/post/event counts, about, province, phone, website
- Tabs: Posts, Created Events, Favorites, Saved Events, Wallet (balance + paid events), Info (editable)
- Badges display
- Actions: Create Post, Go to Dashboard

**User Profile**
- Cover photo, full name, post/event counts, about
- Tabs: Posts, Created Events, Favorites (users & organizers), Saved Events, Info (editable)
- Account Settings: change password, request organizer upgrade, delete account

### 🏅 Badge System
- Users and organizers earn badges based on their activity and event posting milestones.

---

## User Roles

| Role | Description |
|---|---|
| **User** | Browse events, post activities, create events (pending approval), manage profile |
| **Organizer** | All user features + publish events directly, access organizer dashboard and wallet |
| **Moderator** | Review event submissions, handle reports, manage organizer upgrade requests |
| **Admin** | Full system access: user management, category management, transactions, withdrawals |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16+** (App Router) | Framework |
| **React 19+** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Axios / Fetch** | API communication |
| **Zustand / Redux** | State management |

---

## Prerequisites

- [Node.js 21+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/14th-Gen-Basic-Course-Final-Project/Dombon-Khnom-UI.git
cd Dombon-Khnom-UI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Generate an `AUTH_SECRET` by running:

```bash
npx auth secret
```

Then copy the example env file:

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
AUTH_SECRET=your_generated_secret_here
```

> See [Environment Variables](#environment-variables) for all available options.

### 4. Run the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

> ⚠️ Make sure the Spring Boot API is running first for full functionality.

---

## Project Structure

```
dombon-khnom-ui/
├── app/
│   ├── (auth)/                 # Authentication pages
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── reset-password/
│   │   ├── signup/
│   │   └── verify-otp/
│   ├── (main)/                 # Main user-facing pages
│   │   ├── discovery/
│   │   ├── event/
│   │   ├── home/
│   │   ├── notification/
│   │   ├── posts/
│   │   └── profile/
│   └── (dashboard)/            # Role-based dashboards
│       ├── organizer/
│       ├── moderator/
│       └── system-admin/
├── components/                 # Reusable UI components
├── data/                       # Mock data for testing
├── hooks/                      # Custom React hooks
├── lib/                        # Utilities and helpers
├── service/                    # API service functions
├── store/                      # Zustand / Redux state
├── types/                      # TypeScript interfaces
└── public/                     # Static assets
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Spring Boot backend API |
| `AUTH_SECRET` | Secret key for NextAuth session encryption (generate with `npx auth secret`) |
| `NEXT_PUBLIC_MAP_API_KEY` | API key for the map provider |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

---

## API Connection

The UI communicates with a Spring Boot REST API. Before running the frontend:

1. Start the API server (see [API README](./API-readme.md))
2. Ensure CORS is configured on the API to allow `http://localhost:3000`
3. Set `NEXT_PUBLIC_API_URL` in your `.env` to point to the API

---

## Production Build

```bash
npm run build
npm run start
```

For deployment (e.g., Vercel, Docker), set all environment variables on your hosting platform and ensure `NEXT_PUBLIC_API_URL` points to your production API.

---

## 🧪 Test Accounts

Use the following credentials to explore each role locally.

| Role | Email               | Password        | URL |
|---|---------------------|-----------------|---|
| User (no organizer) | `dane003@gmail.com` | `Koko@1234`     | [http://localhost:3000/home](http://localhost:3000/home) |
| User (with organizer) | `dane004@gmail.com` | `Koko@1234` | [http://localhost:3000/home](http://localhost:3000/home) |
| Moderator | `dane002@gmail.com` | `Koko@1234` | [http://localhost:3000/moderator](http://localhost:3000/moderator) |
| Admin | `dane001@gmail.com` | `Koko@1234` | [http://localhost:3000/system-admin](http://localhost:3000/system-admin) |

> ⚠️ Do not use these credentials in production.

---

## Flow Diagrams

### 👤 User Flow

```
Start → Landing Page → Authentication
  ├── Home (Map View)
  │     ├── Event Detail
  │     ├── List View
  │     └── Create Event
  │           └── (pending moderator approval before going public)
  ├── Discovery
  │     ├── Post Activity
  │     ├── Activity Detail
  │     └── Search
  ├── Notifications
  │     └── Likes, comments, approvals, payments
  └── Profile
        ├── Posts / Created Events / Favorites / Saved Events
        ├── Info — edit name, province, phone, about
        └── Account Settings — change password, request organizer, delete account
```

---

### 🏢 Organizer Flow

```
Start → Authentication (as Organizer)
  ├── Home (Map View)    — Browse & filter events
  ├── Discovery          — Feed & gallery, post activity
  ├── Create Event       — Published immediately (no approval needed)
  ├── Notifications      — Likes, comments, payments
  └── Organizer Profile
        ├── Posts / Created Events / Favorites / Saved Events
        ├── Wallet             — Current balance, paid events
        ├── Info               — Edit profile
        └── Organizer Dashboard
              ├── Overview     — KPI cards, charts, upcoming events, top 5
              ├── Event Management — View & manage own events
              └── Wallet       — Earnings chart, balance, transactions
```

---

### 🛡️ Moderator Flow

```
Start → Authentication (as Moderator)    http://localhost:3000/moderator
  └── Moderator Dashboard Overview
        ├── Moderate Event               — Approve / reject events
        ├── Event Submissions            — Review submission table
        │     └── Submission Detail
        ├── Report Management            — Handle reported events & activities
        │     └── Report Detail
        └── Organization Requests        — Approve / reject organizer upgrade requests
```

---

### ⚙️ Admin Flow

```
Start → Authentication (as Admin)        http://localhost:3000/system-admin
  └── Admin Overview
        ├── User Management              — View, delete users; create moderator accounts
        ├── Category Management          — Create, edit, delete categories
        ├── Report Management            — Handle reported events & activities
        │     └── Report Detail
        ├── Transactions                 — View all payment records
        └── Withdrawal Requests          — Approve / reject organizer withdrawals
```

---

## 👨‍💻 Contributors

This project was built by the **14th Gen Basic Course Final Project** team.

| Name                            | Role                                                                         |
|---------------------------------|------------------------------------------------------------------------------|
| **Chamreun Roern**              | Team Leader · Work Flow - ERD -Backend & Frontend Developer · Support Document |
| **Lim Dane**                    | Work Flow - ERD - Backend & Frontend Developer · Git Manager · Support Document |
| **Chhinchheang Dara**           | Work Flow - Frontend Developer · Presenter                                   |
| **Pes Sokry**                   | Frontend Developer · Document                                                |
| **Ros Vanda**                   | Frontend Developer · Backup Presenter                                        |
| **Tang Panhabuth**              | Backend & Frontend Developer · Deployment                               |
| **Chhun Chansreypich (Female)** | Frontend Developer                                                           |
| **MAO Meanmean (Female)**       | Frontend Developer                                                           |
| **Chhorn Vechey**               | Frontend Developer - Support Document                                        |

---

*Built with ❤️ by the 14th Gen Basic Course Final Project team — Cambodia 🇰🇭*