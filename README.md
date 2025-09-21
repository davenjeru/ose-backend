# OSE Backend

[![Coverage Status](https://coveralls.io/repos/github/davenjeru/ose-backend/badge.svg?branch=main)](https://coveralls.io/github/davenjeru/ose-backend?branch=main)
[![Unit Tests](https://github.com/davenjeru/ose-backend/actions/workflows/test-and-coverage.yml/badge.svg)](https://github.com/davenjeru/ose-backend/actions/workflows/test-and-coverage.yml)

A NestJS GraphQL backend with TypeScript and Prisma PostgreSQL integration.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   # Update DATABASE_URL in .env with your PostgreSQL connection string
   ```

3. Generate Prisma client:

   ```bash
   npm run db:generate
   ```

4. Start the development server:
   ```bash
   npm run start:dev
   ```

## GraphQL Endpoint

The GraphQL endpoint is available at: http://localhost:3000/graphql

**GraphQL Playground**: Available only in development mode (when `NODE_ENV=development`). In production, the playground and introspection are disabled for security.

## Example Query

```graphql
query {
  health {
    status
  }
}
```

This query returns:

- `{ status: "healthy" }` if the database connection is successful
- `{ status: "unhealthy" }` if the database connection fails

## Database Setup

To set up a PostgreSQL database:

1. Install PostgreSQL locally or use a cloud service
2. Update the `DATABASE_URL` in your `.env` file
3. Run migrations: `npm run db:migrate`

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run build` - Build the application
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
src/
├── app.module.ts          # Main application module
├── main.ts                # Application entry point
├── schema.gql             # Generated GraphQL schema
├── health/                # Health module with GraphQL resolver
│   ├── health.module.ts
│   └── health.resolver.ts
└── prisma/                # Prisma service and module
    ├── prisma.module.ts
    └── prisma.service.ts
```
