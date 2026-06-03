# Aasa MedChem Inventory and Order Management System

A clean, modern SaaS dashboard for inventory and order management built with Next.js 14 App Router, NextAuth.js, Tailwind CSS, and Neon Serverless PostgreSQL.

## Project Structure

This repository is organized as a monorepo with the following structure:
- **`inventory-app/`**: The Next.js frontend and API route handlers.
- **`inventory-app/seed.js`**: Database migration/seeding script.

## Setup and Run Locally

1. Navigate to the application folder:
   ```bash
   cd inventory-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy/configure environmental variables in `inventory-app/.env.local` (ensure `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` are set).
4. Run the development server:
   ```bash
   npm run dev
   ```

## Deploying to Vercel

If deploying to Vercel:
1. Set the **Root Directory** setting to `inventory-app`.
2. Add environment variables for `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` under Project Settings.
