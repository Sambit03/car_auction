# Drizzle-Zod Implementation Guide

## Overview

This project uses `drizzle-zod` to automatically generate Zod validation schemas from Drizzle ORM table definitions, ensuring type-safe validation across the API.

## Installation

```bash
npm install drizzle-zod zod
```

## Schema Definitions

### Location: `src/db/schema.ts`

The schema file exports both Drizzle tables and their corresponding Zod schemas:

#### Cars Schema

- **Insert Schema**: `insertCarSchema`

  - `make`: string (1-100 chars, required)
  - `model`: string (1-100 chars, required)
  - `year`: integer (1900 to current year + 1, required)

- **Select Schema**: `selectCarSchema`
- **Types**: `InsertCar`, `SelectCar`

#### Dealers Schema

- **Insert Schema**: `insertDealerSchema`

  - `name`: string (1-100 chars, required)
  - `email`: valid email (max 100 chars, required)
  - `passwordHash`: string (min 6 chars, required)

- **Select Schema**: `selectDealerSchema`
- **Types**: `InsertDealer`, `SelectDealer`

#### Auctions Schema

- **Insert Schema**: `insertAuctionSchema`

  - `createdBy`: positive integer (required)
  - `carId`: positive integer (required)
  - `startingPrice`: decimal string format (required)
  - `startTime`: date (required)
  - `endTime`: date (required)
  - `status`: enum ["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"] (default: "DRAFT")
  - `currentHighestBid`: decimal string (optional)
  - `winnerBidId`: positive integer (optional)

- **Select Schema**: `selectAuctionSchema`
- **Types**: `InsertAuction`, `SelectAuction`

#### Bids Schema

- **Insert Schema**: `insertBidSchema`

  - `auctionId`: positive integer (required)
  - `dealerId`: positive integer (required)
  - `bidAmount`: decimal string format (required)
  - `previousBid`: decimal string format (optional)

- **Select Schema**: `selectBidSchema`
- **Types**: `InsertBid`, `SelectBid`

## Validation Middleware

### Location: `src/middleware/validateRequest.ts`

The `validateRequest` middleware function validates incoming request bodies against Zod schemas:

```typescript
import { validateRequest } from "../middleware/validateRequest";
import { insertCarSchema } from "../db/schema";

router.post("/cars", validateRequest(insertCarSchema), async (req, res) => {
  // Request body is now validated and type-safe
});
```

### Error Response Format

When validation fails, the middleware returns:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

## Usage in Routes

### Cars Route (`src/routes/carRoutes.ts`)

- **POST /cars**: Uses `insertCarSchema` for validation
- Validates `make`, `model`, and `year` fields

### Dealers Route (`src/routes/dealerRoutes.ts`)

- **POST /dealers/register**: Uses custom `dealerRegisterSchema`
- Validates `name`, `email`, and `password` fields
- Custom schema allows plain password (gets hashed before DB insert)

### Auctions Route (`src/routes/auctionRoutes.ts`)

- **POST /auctions**: Uses `insertAuctionSchema` for validation
- Validates all auction fields including dates and prices

### Bids Route (`src/routes/bidRoutes.ts`)

- **POST /auctions/:auctionId/bids**: Uses custom `placeBidSchema`
- Validates `dealerId` and `amount` fields

## Custom Schemas

For endpoints with different request formats than DB schemas, create custom Zod schemas:

```typescript
const dealerRegisterSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(100),
  password: z.string().min(6), // Plain password, not hash
});
```

## Benefits

1. **Type Safety**: Schemas are derived from DB definitions, ensuring consistency
2. **Automatic Validation**: Request validation happens before route logic
3. **Better Error Messages**: Zod provides detailed validation errors
4. **Single Source of Truth**: DB schema defines validation rules
5. **Reduced Boilerplate**: No manual validation code in routes

## Example Request/Response

### Valid Request

```bash
curl -X POST http://localhost:3000/api/v1/cars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": 2024
  }'
```

### Invalid Request (Missing Field)

```bash
curl -X POST http://localhost:3000/api/v1/cars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "make": "Toyota",
    "year": 2024
  }'
```

Response:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "model",
      "message": "Required"
    }
  ]
}
```

### Invalid Request (Invalid Data Type)

```bash
curl -X POST http://localhost:3000/api/v1/cars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": "2024"
  }'
```

Response:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "year",
      "message": "Expected number, received string"
    }
  ]
}
```

## Testing Validation

You can test each endpoint's validation by:

1. Sending requests with missing required fields
2. Sending requests with invalid data types
3. Sending requests with out-of-range values (e.g., year = 1800)
4. Sending requests with invalid formats (e.g., malformed email)

The validation middleware will catch all these issues before they reach the database.
