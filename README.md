# OSE Backend

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
  hello
}
```

This query returns:
- `"hi there"` if the database connection is successful
- `"hello, but database connection failed"` if the database connection fails

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
├── hello/                 # Hello module with GraphQL resolver
│   ├── hello.module.ts
│   └── hello.resolver.ts
└── prisma/                # Prisma service and module
    ├── prisma.module.ts
    └── prisma.service.ts
```
