# Mapit — Discover Places, Share Experiences

Mapit is a location-based social discovery platform built with **Next.js**. It allows users to explore places and experiences on an interactive map, share their own discoveries, and record routes.

The idea behind Mapit is simple: discover interesting places through real experiences shared by other people.

## Features

### Explore

- Interactive map powered by Leaflet and React Leaflet.
- Discover public experiences shared by other users.
- View experience details directly in map popups.
- Find nearby experiences based on geographic location.

### Share Experiences

- Create and publish location-based experiences.
- Add descriptions and categories to places.
- Choose whether experiences are public or private.
- Edit and manage your own experiences.

### Route Recording

- Record routes using browser geolocation.
- Track route distance and duration.
- Save recorded routes as experiences.
- Recover an unfinished recording after refreshing the page.

### Authentication & Accounts

- Email and password authentication.
- Email verification during registration.
- Password reset functionality.
- Account management and account deletion.

### Moderation & Administration

- Report inappropriate experiences.
- Admin dashboard for reviewing reports.
- Hide reported content and review moderation history.
- Role-based access and protected administrative actions.

## Tech Stack

| Technology    | Purpose                                    |
| ------------- | ------------------------------------------ |
| Next.js 16    | React framework and application routing    |
| React         | Component-based user interfaces            |
| JavaScript    | Application logic                          |
| Tailwind CSS  | Styling and responsive layouts             |
| Leaflet       | Interactive maps                           |
| React Leaflet | React integration for Leaflet              |
| PostgreSQL    | Relational database                        |
| PostGIS       | Geographic data and location-based queries |
| Better Auth   | Authentication and session management      |
| ESLint        | Code quality and linting                   |

## Getting Started

### Prerequisites

- Node.js
- npm
- A PostgreSQL database with PostGIS enabled
- SMTP credentials for sending authentication emails

### Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/mapit.git
cd mapit
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL=your_postgresql_connection_string

BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000

SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
EMAIL_FROM=your_sender_email
```

Replace the placeholder values with your own credentials. Never commit `.env.local` or expose private credentials in your repository.

Ensure your PostgreSQL database has the required Mapit tables and PostGIS support configured before starting the application.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Checks

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## Project Structure

```text
mapit/
├── app/
│   ├── (app)/          # Main application pages
│   ├── (auth)/         # Authentication pages
│   └── api/            # API routes
├── components/
│   ├── admin/          # Administration components
│   └── map/            # Map and location components
├── lib/
│   ├── db/             # Database queries
│   ├── auth.js         # Authentication configuration
│   ├── email.js        # Email delivery
│   └── validation.js   # Input validation
├── public/
├── proxy.js
└── package.json
```

## What I Learned Building Mapit

Mapit has been an opportunity to work beyond individual frontend components and understand how a complete web application works.

Some of the areas I focused on include:

- Building interactive map experiences and working with browser geolocation APIs.
- Managing asynchronous operations and real-time location tracking.
- Designing database queries for geographic data using PostGIS.
- Implementing authentication, session management, and protected routes.
- Applying server-side validation and access control.
- Building moderation workflows and role-based permissions.
- Handling application state, browser storage, and recovery of unfinished recordings.
- Preparing a Next.js application for production deployment.

## Status

Mapit is an independent portfolio project developed as part of my ongoing journey as a frontend developer.

More improvements and features may be added as the project evolves.
