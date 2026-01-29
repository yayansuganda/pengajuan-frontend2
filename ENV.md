# Environment Variables Documentation

This document explains all environment variables used in the frontend application.

## Required Variables

### API Configuration
- **NEXT_PUBLIC_API_URL**: Backend API base URL
  - Development: `http://localhost:8081`
  - Production: Your production API URL

### Application Configuration
- **NEXT_PUBLIC_APP_NAME**: Application name displayed in the UI
  - Default: `MM Pengajuan`

- **NEXT_PUBLIC_APP_VERSION**: Application version
  - Default: `1.0.0`

## Environment Files

- `.env.local`: Local development environment (not committed to git)
- `.env.example`: Example environment file (committed to git as template)
- `.env.production`: Production environment variables (not committed to git)

## Setup Instructions

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update the values in `.env.local` according to your setup

3. Restart the development server:
   ```bash
   npm run dev
   ```

## Notes

- All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Never commit `.env.local` or `.env.production` to version control
- Always update `.env.example` when adding new environment variables
