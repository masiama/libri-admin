# Libri Admin

Admin panel for managing the Libri catalog and triggering crawler runs.

Built with Vue 3, Vite, TypeScript, Clerk authentication, and Nuxt UI.

## Features

- Browse books with pagination, filtering, and sorting
- Add and Edit book metadata and cover images
- Trigger crawler runs from the admin UI
- Protect admin access with Clerk-issued JWTs

## Requirements

- Node.js 20+
- pnpm
- A running [`libri-api`](https://github.com/masiama/libri-api) instance
- A Clerk application with a publishable key and JWT template

## Environment variables

Create a local env file from the example:

```bash
cp .env.example .env
```

Available variables:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_***
VITE_CLERK_JWT_TEMPLATE=jwt-admin
VITE_API_BASE=http://localhost:8080
```

Notes:

- `VITE_API_BASE` should point to the host running [`libri-api`](https://github.com/masiama/libri-api)
- `VITE_CLERK_JWT_TEMPLATE` must match the Clerk JWT template expected by the API

## Getting started

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

## Authentication

`libri-admin` authenticates users with Clerk and sends a Bearer token to
[`libri-api`](https://github.com/masiama/libri-api).

To access admin endpoints successfully:

- the API must trust your Clerk JWKS URL
- the JWT template used by the admin must match the one expected by the API
- the signed-in user must have `is_admin: true`

Example Clerk public metadata:

```json
{
  "is_admin": true
}
```
