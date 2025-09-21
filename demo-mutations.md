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
      "success": true,
      "message": "Successfully subscribed to newsletter",
      "subscription": {
        "id": "same-uuid",
        "email": "user@example.com"
      }
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
  createReceivedMessage(
    input: {
      email: "user@example.com"
      fullName: "John Doe"
      message: "Hello, I'm interested in learning more about your services."
    }
  ) {
    success
    message
    receivedMessage {
      id
      email
      fullName
      linkedInProfile
      message
      createdAt
    }
  }
}
```

### Usage with LinkedIn Profile

```graphql
mutation CreateReceivedMessageWithLinkedIn {
  createReceivedMessage(
    input: {
      email: "user@example.com"
      fullName: "John Doe"
      linkedInProfile: "https://linkedin.com/in/johndoe"
      message: "Hello, I'm interested in learning more about your services."
    }
  ) {
    success
    message
    receivedMessage {
      id
      email
      fullName
      linkedInProfile
      message
      createdAt
    }
  }
}
```

### Expected Response (Success - New User)

```json
{
  "data": {
    "createReceivedMessage": {
      "success": true,
      "message": "Message received successfully",
      "receivedMessage": {
        "id": "958333d2-1d33-4668-96f8-c1889878529e",
        "email": "user@example.com",
        "fullName": "John Doe",
        "linkedInProfile": null,
        "message": "Hello, I'm interested in learning more about your services.",
        "createdAt": "2025-09-20T19:02:17.086Z"
      }
    }
  }
}
```

### Message Deduplication Behavior

The system uses **message deduplication** based on user + message content:

#### Same User + Same Message = Same ID (Upsert)

When the same message content is sent by the same user, the system returns the **exact same message record** with the same ID:

```graphql
mutation TestDuplicateMessage1 {
  createReceivedMessage(
    input: {
      email: "demo-test@example.com"
      fullName: "Demo User"
      message: "This is a brand new message for documentation."
    }
  ) {
    success
    message
    receivedMessage {
      id
      email
      fullName
      message
      createdAt
    }
  }
}
```

**First Response:**

```json
{
  "data": {
    "createReceivedMessage": {
      "success": true,
      "message": "Message already exists - returning existing message",
      "receivedMessage": {
        "id": "f1dc373e-9ae5-46d2-a689-3fd91b914c33",
        "email": "demo-test@example.com",
        "fullName": "Demo User",
        "message": "This is a brand new message for documentation.",
        "createdAt": "2025-09-20T19:16:10.844Z"
      }
    }
  }
}
```

```graphql
mutation TestDuplicateMessage2 {
  createReceivedMessage(
    input: {
      email: "demo-test@example.com"
      fullName: "Demo User Updated" # User details can be updated
      message: "This is a brand new message for documentation." # Same content
    }
  ) {
    success
    message
    receivedMessage {
      id
      email
      fullName
      message
      createdAt
    }
  }
}
```

**Second Response (Same Message Content):**

```json
{
  "data": {
    "createReceivedMessage": {
      "success": true,
      "message": "Message already exists - returning existing message",
      "receivedMessage": {
        "id": "f1dc373e-9ae5-46d2-a689-3fd91b914c33",
        "email": "demo-test@example.com",
        "fullName": "Demo User Updated",
        "message": "This is a brand new message for documentation.",
        "createdAt": "2025-09-20T19:16:10.844Z"
      }
    }
  }
}
```

**Note:** Same `id` and `createdAt`, but `fullName` is updated to "Demo User Updated".

#### Same User + Different Message = New ID

When different message content is sent by the same user, a new message record is created:

```graphql
mutation TestDifferentMessage {
  createReceivedMessage(
    input: {
      email: "demo-test@example.com"
      fullName: "Demo User"
      message: "This is a DIFFERENT message with new content."
    }
  ) {
    success
    message
    receivedMessage {
      id
      email
      fullName
      message
      createdAt
    }
  }
}
```

**Response (Different Message Content):**

```json
{
  "data": {
    "createReceivedMessage": {
      "success": true,
      "message": "Message already exists - returning existing message",
      "receivedMessage": {
        "id": "b635ea1c-f300-4910-999a-3cb8dc34474d",
        "email": "demo-test@example.com",
        "fullName": "Demo User",
        "message": "This is a DIFFERENT message with new content.",
        "createdAt": "2025-09-20T19:16:27.734Z"
      }
    }
  }
}
```

**Note:** New `id` (`b635ea1c-f300-4910-999a-3cb8dc34474d`) and new `createdAt` timestamp.

### Input Validation and Normalization

The system performs automatic input validation and normalization:

```graphql
mutation TestWhitespaceHandling {
  createReceivedMessage(
    input: {
      email: "whitespace@example.com"
      fullName: "  Whitespace User  "
      linkedInProfile: "   "
      message: "  Testing whitespace handling  "
    }
  ) {
    success
    message
    receivedMessage {
      id
      email
      fullName
      linkedInProfile
      message
      createdAt
    }
  }
}
```

### Response (Normalized Input)

```json
{
  "data": {
    "createReceivedMessage": {
      "success": true,
      "message": "Message received successfully",
      "receivedMessage": {
        "id": "d9e04128-4414-4cfc-aed7-2cc108c2da87",
        "email": "whitespace@example.com",
        "fullName": "Whitespace User",
        "linkedInProfile": null,
        "message": "Testing whitespace handling",
        "createdAt": "2025-09-20T19:03:01.192Z"
      }
    }
  }
}
```

### Message Length Validation

Messages are limited to **1000 characters**. Longer messages will be rejected:

```graphql
mutation TestMessageTooLong {
  createReceivedMessage(
    input: {
      email: "length-test@example.com"
      fullName: "Length Test"
      message: "AAAAAAAAAA..." # 1001+ characters
    }
  ) {
    success
    message
    receivedMessage {
      id
      message
    }
  }
}
```

**Response (Message Too Long):**

```json
{
  "errors": [
    {
      "message": "Bad Request Exception",
      "extensions": {
        "code": "BAD_REQUEST",
        "originalError": {
          "message": ["Message cannot exceed 1000 characters"],
          "error": "Bad Request",
          "statusCode": 400
        }
      }
    }
  ],
  "data": null
}
```

### Validation Error (Invalid Email Format)

```json
{
  "errors": [
    {
      "message": "Bad Request Exception",
      "extensions": {
        "code": "BAD_REQUEST",
        "originalError": {
          "message": ["Please provide a valid email address"],
          "error": "Bad Request",
          "statusCode": 400
        }
      }
    }
  ],
  "data": null
}
```

## Features Implemented

### Newsletter Subscription

- ✅ Email validation (required, must be valid email format)
- ✅ **Subscription deduplication**: Same email returns existing subscription (upsert)
- ✅ Email normalization (lowercase, trimmed)
- ✅ Comprehensive unit tests (5 test cases)
- ✅ E2E tests (5 test cases)

### Received Messages

- ✅ Email validation (required, must be valid email format)
- ✅ Full name validation (required, string)
- ✅ Message validation (required, string, max 1000 characters)
- ✅ LinkedIn profile (optional, string)
- ✅ User creation for new email addresses
- ✅ User update for existing email addresses (updates fullName and linkedInProfile)
- ✅ **Message deduplication**: Same user + same message content = same ID (upsert)
- ✅ **Message length constraint**: 1000 character limit enforced
- ✅ Input normalization (trimmed strings, lowercase email)
- ✅ Empty/whitespace LinkedIn profiles converted to null
- ✅ Comprehensive unit tests (9 test cases)
- ✅ E2E tests confirmed working

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
- `User` model with unique email constraint for user information
- `ReceivedMessage` model linked to users via `userId` with:
  - **Message length constraint**: `content VARCHAR(1000)`
  - **Unique constraint**: `@@unique([userId, content])` for deduplication
  - Multiple different messages per user allowed
- UUID primary keys with PostgreSQL `gen_random_uuid()`
- Automatic timestamps (`createdAt`, `updatedAt`)

## Testing with curl

You can test these mutations using curl commands:

```bash
# Test basic message creation (first time)
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createReceivedMessage(input: { email: \"test@example.com\", fullName: \"John Doe\", message: \"Hello world!\" }) { success message receivedMessage { id email fullName message createdAt } } }"
  }'

# Test message deduplication (same message content returns same ID)
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createReceivedMessage(input: { email: \"test@example.com\", fullName: \"John Doe Updated\", message: \"Hello world!\" }) { success message receivedMessage { id email fullName message createdAt } } }"
  }'

# Test different message content (gets new ID)
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createReceivedMessage(input: { email: \"test@example.com\", fullName: \"John Doe\", message: \"This is a different message!\" }) { success message receivedMessage { id email fullName message createdAt } } }"
  }'

# Test newsletter subscription
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createNewsletterSubscription(input: { email: \"newsletter@example.com\" }) { success message subscription { id email } } }"
  }'
```

## Key Behaviors Summary

### Newsletter Subscriptions

| Scenario                   | Behavior                      | Subscription ID | Response Message                        |
| -------------------------- | ----------------------------- | --------------- | --------------------------------------- |
| **New email subscription** | Creates new subscription      | New unique ID   | "Successfully subscribed to newsletter" |
| **Duplicate email**        | Returns existing subscription | **Same ID**     | "Successfully subscribed to newsletter" |
| **Invalid email format**   | Validation error              | N/A             | "Please provide a valid email address"  |

### Received Messages

| Scenario                              | Behavior                 | Message ID    | Response Message                                      |
| ------------------------------------- | ------------------------ | ------------- | ----------------------------------------------------- |
| **New user + new message**            | Creates user and message | New unique ID | "Message received successfully"                       |
| **Existing user + same message**      | Returns existing message | **Same ID**   | "Message already exists - returning existing message" |
| **Existing user + different message** | Creates new message      | New unique ID | "Message received successfully"                       |
| **Message > 1000 chars**              | Validation error         | N/A           | "Message cannot exceed 1000 characters"               |
| **Invalid email format**              | Validation error         | N/A           | "Please provide a valid email address"                |

**The key feature**: Same user + same message content will **always return the identical message record with the same ID and timestamp**, enabling perfect deduplication.
