# Car Auction API

A production-ready RESTful API for managing car auctions built with **Express.js**, **TypeScript**, and **Drizzle ORM** with PostgreSQL. Features comprehensive security, validation, rate limiting, and 100% test coverage.

## Features

- **Car Management** - Complete CRUD operations for vehicle listings
- **Dealer Management** - Secure dealer registration with bcrypt password hashing
- **Auction System** - Full lifecycle management with status transitions (DRAFT → LIVE → ENDED → CLOSED)
- **Bidding System** - Real-time bid placement with validation and bid chain tracking
- **JWT Authentication** - Secure API endpoints with 24-hour token expiration
- **Request Validation** - Automatic validation using Zod schemas with drizzle-zod
- **Security Headers** - Helmet middleware with CSP, HSTS, XSS protection, and more
- **Rate Limiting** - Three-tier rate limiting (authentication, general API, strict bid limiting)
- **TypeScript** - Full type safety with comprehensive type definitions
- **Drizzle ORM** - Type-safe database queries with PostgreSQL
- **Comprehensive Testing** - 60 test cases with Jest and Supertest (100% passing)
- **Error Handling** - Detailed error messages with field-level validation feedback

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js v5.1.0
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM v0.44.6
- **Authentication**: JWT (jsonwebtoken) with 24h expiration
- **Password Hashing**: bcrypt (10 salt rounds)
- **Validation**: Zod with drizzle-zod v0.8.3
- **Security**: Helmet v8.1.0
- **Rate Limiting**: express-rate-limit v8.2.0
- **Testing**: Jest with ts-jest, Supertest, 60 test cases

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (local or cloud like Neon)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd car_auction
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your_secret_key_here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=adminpassword007
   PORT=3000
   NODE_ENV=development
   ```

4. **Run database migrations**

   ```bash
   npm run db:push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`

6. **Run tests (optional)**

   ```bash
   npm test
   ```

   All 60 tests should pass

## Authentication

### Get JWT Token

All API endpoints (except `/api/v1/auction/token` and `/health`) require JWT authentication.

**Endpoint**: `POST /api/v1/auction/token`

**Request**:

```json
{
  "username": "admin",
  "password": "adminpassword007"
}
```

**Response**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token Details**:

- Expiration: 24 hours
- Algorithm: HS256
- Rate Limited: 5 requests per 15 minutes

**Usage**: Include the token in all subsequent requests:

```
Authorization: Bearer <your_token_here>
```

**Example with cURL**:

```bash
curl -H "Authorization: Bearer eyJhbGci..." http://localhost:3000/api/v1/cars
```

## API Endpoints

### Authentication

- `POST /api/v1/auction/token` - Generate JWT token (no auth required)

### Cars

- `GET /api/v1/cars` - Get all cars
- `GET /api/v1/cars/:id` - Get car by ID
- `POST /api/v1/cars` - Create new car (validated with Zod)
- `PUT /api/v1/cars/:id` - Update car
- `DELETE /api/v1/cars/:id` - Delete car

### Dealers

- `GET /api/v1/dealers` - Get all dealers (password hashes excluded)
- `GET /api/v1/dealers/:id` - Get dealer by ID
- `POST /api/v1/dealers/register` - Register new dealer (validated, password hashed)
- `PUT /api/v1/dealers/:id` - Update dealer
- `DELETE /api/v1/dealers/:id` - Delete dealer
- `GET /api/v1/dealers/:id/bids` - Get all bids by dealer

### Auctions

- `GET /api/v1/auctions` - Get all auctions with car details
- `GET /api/v1/auctions/active` - Get only live auctions
- `GET /api/v1/auctions/:id` - Get auction details with all bids
- `GET /api/v1/auctions/:id/highest-bid` - Get current highest bid
- `GET /api/v1/auctions/:id/winner` - Get auction winner (closed auctions only)
- `POST /api/v1/auctions` - Create new auction (validated)
- `PUT /api/v1/auctions/:id` - Update auction (draft only)
- `PATCH /api/v1/auctions/:id/status` - Update auction status (state machine)
- `DELETE /api/v1/auctions/:id` - Delete auction (non-live only)

### Bids

- `GET /api/v1/bids` - Get all bids
- `GET /api/v1/bids/:id` - Get bid by ID
- `GET /api/v1/auctions/:auctionId/bids` - Get all bids for auction
- `POST /api/v1/auctions/:auctionId/bids` - Place bid (strict rate limit: 10/min)
- `PUT /api/v1/bids/:id` - Update bid (live auctions only)
- `DELETE /api/v1/bids/:id` - Delete bid (live auctions only)

### Health

- `GET /health` - Health check endpoint (no auth required)

**Complete Documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed request/response examples, validation rules, and error codes.

## 📊 Database Schema

### Cars Table

```typescript
{
  carId: number(PK);
  make: string;
  model: string;
  year: number;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Dealers Table

```typescript
{
  dealerId: number(PK);
  name: string;
  email: string;
  passwordHash: string;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Auctions Table

```typescript
{
  auctionId: number(PK);
  carId: number(FK);
  createdBy: number(FK);
  status: string(DRAFT | LIVE | ENDED | CLOSED | CANCELLED);
  startingPrice: decimal;
  currentHighestBid: decimal;
  startTime: timestamp;
  endTime: timestamp;
  winnerBidId: number(FK);
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Bids Table

```typescript
{
  bidId: number(PK);
  auctionId: number(FK);
  dealerId: number(FK);
  bidAmount: decimal;
  previousBid: decimal;
  timePlaced: timestamp;
}
```

## Auction Status Flow

The auction system uses a state machine with the following transitions:

```
DRAFT → LIVE → ENDED → CLOSED
  ↓       ↓
CANCELLED
```

### Status Definitions

- **DRAFT**: Auction created but not started (can be edited or deleted)
- **LIVE**: Auction is active and accepting bids
- **ENDED**: Auction time expired, no more bids accepted
- **CLOSED**: Winner determined, auction finalized
- **CANCELLED**: Auction cancelled (terminal state)

### Valid Transitions

- DRAFT → LIVE, CANCELLED
- LIVE → ENDED, CANCELLED
- ENDED → CLOSED
- CLOSED → (no transitions)
- CANCELLED → (no transitions)

### Auto-Winner Selection

When transitioning from LIVE to ENDED or CLOSED, the system automatically:

- Identifies the highest bid
- Sets the `winnerBidId` field
- Updates `currentHighestBid` with the winning amount

## Testing

### Automated Tests

The project includes a comprehensive test suite with 60 test cases covering all endpoints:

```bash
npm test
```

**Test Coverage**:

- 6 test suites
- 60 tests (100% passing)
- Authentication (5 tests)
- Car endpoints (11 tests)
- Dealer endpoints (9 tests)
- Auction endpoints (10 tests)
- Bid endpoints (12 tests)
- Health & middleware (13 tests)

**Test Stack**:

- Jest with ts-jest preset
- Supertest for HTTP testing
- Real database integration tests

### Manual Testing with cURL

1. **Get authentication token**:

   ```bash
   curl -X POST http://localhost:3000/api/v1/auction/token \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"adminpassword007"}'
   ```

2. **Create a car**:

   ```bash
   curl -X POST http://localhost:3000/api/v1/cars \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"make":"Toyota","model":"Camry","year":2023}'
   ```

3. **Get all cars**:
   ```bash
   curl -X GET http://localhost:3000/api/v1/cars \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Using Postman or Thunder Client

1. Import the API endpoints from [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Set up an environment variable for the JWT token
3. Test all endpoints with proper authentication
4. Check rate limit headers in responses

## Project Structure

```
car_auction/
├── src/
│   ├── app.ts                    # Main Express app with Helmet & rate limiting
│   ├── db/
│   │   └── schema.ts             # Drizzle schema with Zod validation
│   ├── middleware/
│   │   ├── verifyToken.ts        # JWT authentication middleware
│   │   └── validateRequest.ts    # Zod validation middleware
│   └── routes/
│       ├── authRoutes.ts         # Token generation endpoint
│       ├── carRoutes.ts          # Car CRUD with validation
│       ├── dealerRoutes.ts       # Dealer CRUD with bcrypt
│       ├── auctionRoutes.ts      # Auction management with state machine
│       └── bidRoutes.ts          # Bidding with strict rate limiting
├── tests/
│   ├── setup.ts                  # Test environment configuration
│   ├── auth.test.ts              # Authentication tests (5)
│   ├── cars.test.ts              # Car endpoint tests (11)
│   ├── dealers.test.ts           # Dealer endpoint tests (9)
│   ├── auctions.test.ts          # Auction endpoint tests (10)
│   ├── bids.test.ts              # Bid endpoint tests (12)
│   └── health.test.ts            # Health & middleware tests (13)
├── drizzle/
│   ├── meta/                     # Drizzle migration metadata
│   └── *.sql                     # SQL migration files
├── .env                          # Environment variables (not committed)
├── .env.test                     # Test environment variables
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── jest.config.js                # Jest test configuration
├── drizzle.config.ts             # Drizzle ORM configuration
└── API_DOCUMENTATION.md          # Complete API reference
```

## NPM Scripts

```bash
npm run dev          # Start development server with tsx
npm start            # Start production server
npm run build        # Compile TypeScript to JavaScript
npm test             # Run all Jest tests (60 tests)
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio (database GUI)
```

## Security Features

### 1. Authentication & Authorization

- JWT tokens with 24-hour expiration
- Secure token generation with HS256 algorithm
- Bearer token authentication on all protected routes
- Rate limited token endpoint (5 requests per 15 minutes)

### 2. Password Security

- bcrypt hashing with 10 salt rounds
- Password hashes never returned in API responses
- Minimum 6-character password requirement
- Secure password updates

### 3. HTTP Security Headers (Helmet)

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- DNS Prefetch Control
- Download Options
- Cross-Domain Policies

### 4. Rate Limiting (Three Tiers)

**Authentication Rate Limit**:

- Endpoint: `/api/v1/auction/token`
- Limit: 5 requests per 15 minutes
- Purpose: Prevent brute force attacks

**General API Rate Limit**:

- Endpoints: All `/api/v1/*` routes
- Limit: 100 requests per 15 minutes
- Purpose: General API protection

**Strict Rate Limit (Bid Placement)**:

- Endpoint: `POST /api/v1/auctions/:auctionId/bids`
- Limit: 10 requests per 1 minute
- Purpose: Prevent bid spam

### 5. Input Validation

- Automatic validation using Zod schemas
- Type-safe validation with drizzle-zod
- Field-level error messages
- Prevents SQL injection via Drizzle ORM
- Sanitizes all user input

## Error Handling

The API uses consistent error response formats with detailed messages:

### Standard Error Response

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Validation Error Response

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email"
    },
    {
      "field": "password",
      "message": "String must contain at least 6 character(s)"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning               | Usage                                    |
| ---- | --------------------- | ---------------------------------------- |
| 200  | OK                    | Successful GET, PUT, DELETE              |
| 201  | Created               | Successful POST creating resource        |
| 400  | Bad Request           | Validation errors, missing fields        |
| 401  | Unauthorized          | Missing/invalid token, wrong credentials |
| 404  | Not Found             | Resource doesn't exist                   |
| 429  | Too Many Requests     | Rate limit exceeded                      |
| 500  | Internal Server Error | Server-side errors                       |

## Environment Variables

Required variables in `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
JWT_SECRET=your-secure-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=adminpassword007

# Server
PORT=3000
NODE_ENV=development
```

**Security Note**: Never commit `.env` file to version control. Keep `JWT_SECRET` secure and rotate regularly.

## Documentation

For complete API reference with all endpoints, request/response examples, and cURL commands, see **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

## Development Workflow

### 1. Local Development

```bash
npm run dev          # Start server with auto-reload
npm run db:studio    # Open database GUI
```

### 2. Making Schema Changes

```bash
# Edit src/db/schema.ts
npm run db:push      # Push changes to database
```

### 3. Running Tests

```bash
npm test             # Run all tests
npm test -- --watch  # Run tests in watch mode
```

### 4. Building for Production

```bash
npm run build        # Compile TypeScript
npm start            # Start production server
```

## Best Practices

### API Usage

- Always include `Authorization: Bearer <token>` header on protected routes
- Check rate limit headers (`X-RateLimit-Remaining`) to avoid throttling
- Handle all HTTP status codes appropriately
- Validate input on client side before sending requests
- Use HTTPS in production

### Database

- Use transactions for related operations
- Index frequently queried fields
- Regular database backups
- Monitor query performance

### Security

- Rotate JWT_SECRET regularly
- Use strong passwords for admin account
- Enable HTTPS/TLS in production
- Monitor rate limit violations
- Keep dependencies updated

## Troubleshooting

### Common Issues

**1. Database Connection Failed**

```
Error: Connection refused
```

Solution: Check `DATABASE_URL` in `.env` and ensure PostgreSQL is running

**2. JWT Token Invalid**

```
401 Unauthorized: Invalid token
```

Solution: Generate a new token using `/api/v1/auction/token` endpoint

**3. Rate Limit Exceeded**

```
429 Too Many Requests
```

Solution: Wait for rate limit window to reset (check `X-RateLimit-Reset` header)

**4. Validation Errors**

```
400 Bad Request: Validation failed
```

Solution: Check the `details` array in error response for specific field errors

## Production Deployment

### Recommended Setup

- Use environment variables for sensitive data
- Enable HTTPS/TLS
- Set `NODE_ENV=production`
- Use a process manager (PM2, systemd)
- Set up monitoring and logging
- Configure database connection pooling
- Use a reverse proxy (Nginx, Apache)

### Environment Configuration

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=strong-random-secret
PORT=3000
```

## Performance Optimization

- Database connection pooling enabled (Neon serverless)
- Efficient SQL queries via Drizzle ORM
- Rate limiting prevents API abuse
- Proper indexing on foreign keys
- JWT tokens cached for duration
- Helmet middleware optimized

## License

ISC

## Support

For issues, questions, or contributions, please refer to the documentation files or create an issue in the repository.

## Acknowledgments

Built with Express.js, TypeScript, Drizzle ORM, and PostgreSQL. Secured with Helmet, bcrypt, and JWT. Tested with Jest and Supertest.
