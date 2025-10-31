# car_auction

# 🚗 Car Auction API

A comprehensive RESTful API for managing car auctions built with **Express.js**, **TypeScript**, and **Drizzle ORM** with PostgreSQL.

## 📋 Features

- ✅ **Car Management** - CRUD operations for cars
- ✅ **Dealer Management** - Register and manage dealers with secure password hashing
- ✅ **Auction System** - Create, manage, and close auctions with status transitions
- ✅ **Bidding System** - Place bids with real-time validation
- ✅ **JWT Authentication** - Secure API endpoints with JWT tokens
- ✅ **TypeScript** - Full type safety and IntelliSense support
- ✅ **Drizzle ORM** - Type-safe database queries
- ✅ **Error Handling** - Comprehensive error handling and validation

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt

## 📦 Installation

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
   DATABASE_URL=your_postgresql_database_url
   JWT_SECRET=your_secret_key_here
   PORT=3000
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

## 🔐 Authentication

### Get JWT Token

All API endpoints (except `/api/v1/auction/token` and `/health`) require JWT authentication.

**Endpoint**: `POST /api/v1/auction/token`

**Request**:

```json
{
  "username": "Admin",
  "password": "Admin"
}
```

**Response**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Usage**: Include the token in all subsequent requests:

```
Authorization: Bearer <your_token_here>
```

## 📚 API Endpoints

### Cars

- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get car by ID
- `POST /api/cars` - Create new car
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car

### Dealers

- `GET /api/dealers` - Get all dealers
- `GET /api/dealers/:id` - Get dealer by ID
- `POST /api/dealers` - Register new dealer
- `PUT /api/dealers/:id` - Update dealer
- `DELETE /api/dealers/:id` - Delete dealer
- `GET /api/dealers/:id/bids` - Get dealer's bids

### Auctions

- `GET /api/auctions` - Get all auctions
- `GET /api/auctions/active` - Get active auctions
- `GET /api/auctions/:id` - Get auction by ID (with bids)
- `GET /api/auctions/:id/highest-bid` - Get highest bid
- `GET /api/auctions/:id/winner` - Get auction winner
- `POST /api/auctions` - Create new auction
- `PUT /api/auctions/:id` - Update auction
- `PATCH /api/auctions/:id/status` - Update auction status
- `DELETE /api/auctions/:id` - Delete auction

### Bids

- `GET /api/bids` - Get all bids
- `GET /api/bids/:id` - Get bid by ID
- `GET /api/auctions/:auctionId/bids` - Get bids for auction
- `POST /api/auctions/:auctionId/bids` - Place new bid
- `PUT /api/bids/:id` - Update bid
- `DELETE /api/bids/:id` - Delete bid

For detailed API documentation with request/response examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

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

## 🔄 Auction Status Flow

```
DRAFT → LIVE → ENDED → CLOSED
  ↓       ↓
CANCELLED
```

- **DRAFT**: Auction created but not started
- **LIVE**: Auction is active and accepting bids
- **ENDED**: Auction time expired
- **CLOSED**: Winner determined, auction finalized
- **CANCELLED**: Auction cancelled

## 🧪 Testing

### Using cURL

1. **Get authentication token**:

   ```bash
   curl -X POST http://localhost:3000/api/v1/auction/token \
     -H "Content-Type: application/json" \
     -d '{"username":"Admin","password":"Admin"}'
   ```

2. **Create a car**:

   ```bash
   curl -X POST http://localhost:3000/api/cars \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"make":"Toyota","model":"Camry","year":2022}'
   ```

3. **Get all cars**:
   ```bash
   curl -X GET http://localhost:3000/api/cars \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Using Postman

1. Import the API endpoints from the documentation
2. Set up an environment variable for the JWT token
3. Test all endpoints with proper authentication

## 📁 Project Structure

```
car_auction/
├── src/
│   ├── app.ts                 # Main application entry
│   ├── db/
│   │   └── schema.ts          # Database schema definitions
│   ├── middleware/
│   │   └── verifyToken.ts     # JWT authentication middleware
│   └── routes/
│       ├── authRoutes.ts      # Authentication endpoints
│       ├── carRoutes.ts       # Car CRUD endpoints
│       ├── dealerRoutes.ts    # Dealer CRUD endpoints
│       ├── auctionRoutes.ts   # Auction management endpoints
│       └── bidRoutes.ts       # Bidding endpoints
├── drizzle/                   # Database migrations
├── .env                       # Environment variables
├── .env.example               # Example environment file
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
├── drizzle.config.ts          # Drizzle ORM configuration
└── API_DOCUMENTATION.md       # Detailed API docs

```

## 🚀 NPM Scripts

```json
{
  "dev": "tsx src/app.ts", // Start development server
  "start": "tsx src/app.ts", // Start production server
  "build": "tsc", // Compile TypeScript
  "db:push": "drizzle-kit push", // Push schema changes
  "db:studio": "drizzle-kit studio" // Open Drizzle Studio
}
```

## ⚠️ Error Handling

The API uses consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

**Status Codes**:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ Input validation
- ✅ SQL injection prevention (via Drizzle ORM)
- ✅ Environment variable management

## 📝 License

ISC

## 👥 Contributors

car auction api
