# ARV

## Demo

[Open the live demo](https://arv.ramseyer.com.ar)

- **Email:** `demo@example.com`
- **Password:** `arvdemo`

Web application for managing agricultural spraying operations.

The backend repository is available at [github.com/cmramseyer/arv](https://github.com/cmramseyer/arv).

## Features

- Manage farms, fields, crops, products, and operators.
- Create, complete, search, and edit spraying work orders.
- Track invoicing and payments.
- Generate reports and view operational statistics.
- Attach and annotate images and documents.

## Getting Started

Requirements: Node.js 22, npm, and the ARV API running locally.

```bash
npm ci
cp .env.example .env.development
npm run dev
```

The application runs at `http://localhost:5173` and expects the API at
`http://localhost:3000` by default.

## Configuration

Set `VITE_API_URL` to the API base URL. When omitted, it defaults to `/api`.

```env
VITE_API_URL=http://localhost:3000
```

Authentication uses secure cookies and CSRF protection provided by the API.

## Commands

```bash
npm run dev           # Start the development server
npm run build         # Create a production build
npm run typecheck     # Check TypeScript types
npm run lint          # Run ESLint
npm test -- --run     # Run the test suite once
npm run test:coverage # Run tests with coverage
```

## Stack

React, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router, Vitest,
Testing Library, and MSW.

The API contract is available at [`openapi/v1/openapi.yaml`](openapi/v1/openapi.yaml).
