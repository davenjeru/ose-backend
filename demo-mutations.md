# GraphQL Mutations Demo

This document demonstrates how to use the two implemented mutations.

## 1. Newsletter Subscription Mutation

### Basic Usage
```graphql
mutation CreateNewsletterSubscription {
  createNewsletterSubscription(input: { email: "user@example.com" }) {
    success
    message
    subscription {
      id
      email
    }
  }
}
```

### Expected Response (Success)
```json
{
  "data": {
    "createNewsletterSubscription": {
      "success": true,
      "message": "Successfully subscribed to newsletter",
      "subscription": {
        "id": "generated-uuid",
        "email": "user@example.com"
      }
    }
  }
}
```

### Expected Response (Duplicate Email)
```json
{
  "data": {
    "createNewsletterSubscription": {
      "success": false,
      "message": "This email is already subscribed to the newsletter",
      "subscription": null
    }
  }
}
```

### Validation Error (Invalid Email)
```json
{
  "errors": [
    {
      "message": "Please provide a valid email address",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

## 2. Received Message Mutation

### Basic Usage (without LinkedIn)
```graphql
mutation CreateReceivedMessage {
  createReceivedMessage(input: {
    email: "user@example.com"
    fullName: "John Doe"
    message: "Hello, I'm interested in learning more about your services."
  }) {
    success
    message
    receivedMessage {
      id
      email
      fullName
      linkedInProfile
      message
      createdAt
      updatedAt
    }
  }
}
```

### Usage with LinkedIn Profile
```graphql
mutation CreateReceivedMessageWithLinkedIn {
  createReceivedMessage(input: {
    email: "user@example.com"
    fullName: "John Doe"
    linkedInProfile: "https://linkedin.com/in/johndoe"
    message: "Hello, I'm interested in learning more about your services."
  }) {
    success
    message
    receivedMessage {
      id
      email
      fullName
      linkedInProfile
      message
      createdAt
      updatedAt
    }
  }
}
```

### Expected Response (Success)
```json
{
  "data": {
    "createReceivedMessage": {
      "success": true,
      "message": "Message received successfully",
      "receivedMessage": {
        "id": "generated-uuid",
        "email": "user@example.com",
        "fullName": "John Doe",
        "linkedInProfile": null,
        "message": "Hello, I'm interested in learning more about your services.",
        "createdAt": "2025-09-20T16:30:00Z",
        "updatedAt": "2025-09-20T16:30:00Z"
      }
    }
  }
}
```

### Expected Response (Duplicate Email)
```json
{
  "data": {
    "createReceivedMessage": {
      "success": false,
      "message": "A message from this email address has already been received",
      "receivedMessage": null
    }
  }
}
```

## Features Implemented

### Newsletter Subscription
- ✅ Email validation (required, must be valid email format)
- ✅ Duplicate email handling (graceful error message)
- ✅ Email normalization (lowercase, trimmed)
- ✅ Comprehensive unit tests (5 test cases)
- ✅ E2E tests (5 test cases)

### Received Messages
- ✅ Email validation (required, must be valid email format)
- ✅ Full name validation (required, string)
- ✅ Message validation (required, string)
- ✅ LinkedIn profile (optional, string)
- ✅ Duplicate email handling (graceful error message)
- ✅ Input normalization (trimmed strings, lowercase email)
- ✅ Comprehensive unit tests (7 test cases)
- ✅ E2E tests (8 test cases)

## Running Tests

### Unit Tests
```bash
npm test -- --testPathPatterns="newsletter.resolver.spec.ts|messages.resolver.spec.ts"
```

### E2E Tests
```bash
npm run test:e2e -- --testNamePattern="Newsletter|Messages"
```

## Database Schema
Both mutations use the Prisma schema defined in `prisma/schema.prisma`:

- `NewsletterSubscription` model with unique email constraint
- `ReceivedMessage` model with unique email constraint
- UUID primary keys with PostgreSQL `gen_random_uuid()`
- Automatic timestamps (`createdAt`, `updatedAt`)
