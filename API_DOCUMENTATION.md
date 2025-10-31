# Car Auction API - Complete Documentation# Car Auction API Documentation

## Table of Contents## Base URL

1. [Overview](#overview)

2. [Base URL](#base-url)```

3. [Authentication](#authentication)http://localhost:3000

4. [Rate Limiting](#rate-limiting)```

5. [Error Handling](#error-handling)

6. [API Endpoints](#api-endpoints)## Authentication

   - [Authentication](#authentication-endpoints)

   - [Cars](#car-endpoints)All API endpoints (except `/api/v1/auction/token` and `/health`) require JWT authentication.

   - [Dealers](#dealer-endpoints)

   - [Auctions](#auction-endpoints)### Get JWT Token

   - [Bids](#bid-endpoints)

   - [Health Check](#health-check)**POST** `/api/v1/auction/token`

---**Request Body:**

## Overview```json

{

The Car Auction API is a RESTful API built with Express.js, TypeScript, and Drizzle ORM. It provides comprehensive functionality for managing car auctions, including vehicle listings, dealer registration, auction management, and bid placement. "username": "Admin",

"password": "Admin"

### Technology Stack}

- **Runtime**: Node.js with TypeScript```

- **Framework**: Express.js v5.1.0

- **Database**: PostgreSQL (Neon serverless)**Response:**

- **ORM**: Drizzle ORM v0.44.6

- **Authentication**: JWT (JSON Web Tokens)```json

- **Validation**: Zod with drizzle-zod{

- **Security**: Helmet, bcrypt, express-rate-limit "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

}

### Key Features```

- JWT-based authentication with 24-hour token expiration

- Request validation using Zod schemas**Usage:**

- Comprehensive security headers via HelmetInclude the token in the Authorization header for all protected routes:

- Three-tier rate limiting (authentication, general API, bid placement)

- Password hashing with bcrypt (10 rounds)```

- RESTful design with proper HTTP status codesAuthorization: Bearer <your_token_here>

- Detailed error messages for debugging```

---

## Base URL## Car Routes

````### Get All Cars

http://localhost:3000/api/v1

```**GET** `/api/cars`



All API endpoints are prefixed with `/api/v1` except for the health check endpoint.**Response:**



---```json

{

## Authentication  "success": true,

  "count": 2,

### Overview  "data": [

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints, you must include a valid JWT token in the Authorization header.    {

      "carId": 1,

### Getting a Token      "make": "Toyota",

      "model": "Camry",

**Endpoint**: `POST /api/v1/auction/token`      "year": 2022,

      "createdAt": "2025-01-01T00:00:00.000Z",

**Request Body**:      "updatedAt": "2025-01-01T00:00:00.000Z"

```json    }

{

  "username": "admin",}

  "password": "adminpassword007"```

}

```### Get Car by ID



**Success Response (200)**:**GET** `/api/cars/:id`

```json

{**Response:**

  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

}```json

```{

  "success": true,

**Token Details**:  "data": {

- Expiration: 24 hours    "carId": 1,

- Algorithm: HS256    "make": "Toyota",

- Payload: `{ username: "admin" }`    "model": "Camry",

    "year": 2022,

### Using the Token    "createdAt": "2025-01-01T00:00:00.000Z",

    "updatedAt": "2025-01-01T00:00:00.000Z"

Include the token in the Authorization header for all protected endpoints:  }

}

````

Authorization: Bearer <your-token-here>

```````### Create New Car



**Example**:**POST** `/api/cars`

```bash

curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \**Request Body:**

  http://localhost:3000/api/v1/cars

``````json

{

### Token Errors  "make": "Toyota",

  "model": "Camry",

**401 Unauthorized** - Missing or invalid token:  "year": 2022

```json}

{```

  "error": "Unauthorized",

  "message": "Access denied. No token provided."**Response (201):**

}

``````json

{

**401 Unauthorized** - Expired token:  "success": true,

```json  "message": "Car created successfully",

{  "data": {

  "error": "Unauthorized",    "carId": 1,

  "message": "Invalid token."    "make": "Toyota",

}    "model": "Camry",

```    "year": 2022,

    "createdAt": "2025-01-01T00:00:00.000Z"

---  }

}

## Rate Limiting```



The API implements three levels of rate limiting to prevent abuse:### Update Car



### 1. Authentication Rate Limit**PUT** `/api/cars/:id`

- **Applies to**: `/api/v1/auction/token`

- **Limit**: 5 requests per 15 minutes per IP**Request Body:**

- **Purpose**: Prevent brute force attacks on authentication

```json

### 2. General Rate Limit{

- **Applies to**: All `/api/v1/*` endpoints  "make": "Honda",

- **Limit**: 100 requests per 15 minutes per IP  "model": "Accord",

- **Purpose**: General API protection  "year": 2023

}

### 3. Strict Rate Limit (Bid Placement)```

- **Applies to**: `POST /api/v1/auctions/:auctionId/bids`

- **Limit**: 10 requests per 1 minute per IP**Response:**

- **Purpose**: Prevent bid spam and ensure fair auction participation

```json

### Rate Limit Headers{

  "success": true,

All responses include rate limit information:  "message": "Car updated successfully",

  "data": {

```    "carId": 1,

X-RateLimit-Limit: 100    "make": "Honda",

X-RateLimit-Remaining: 95    "model": "Accord",

X-RateLimit-Reset: 1730000000    "year": 2023,

```    "updatedAt": "2025-01-02T00:00:00.000Z"

  }

### Rate Limit Exceeded Response (429)}

```````

````json

{### Delete Car

  "error": "Too many requests",

  "message": "Too many requests from this IP, please try again later."**DELETE** `/api/cars/:id`

}

```**Response:**



---```json

{

## Error Handling  "success": true,

  "message": "Car deleted successfully"

### Standard Error Response Format}

````

```````json

{---

  "error": "Error Type",

  "message": "Detailed error message"## Dealer Routes

}

```### Get All Dealers



### HTTP Status Codes**GET** `/api/dealers`



| Status Code | Meaning | Common Scenarios |**Response:**

|-------------|---------|------------------|

| 200 | OK | Successful GET, PUT, DELETE requests |```json

| 201 | Created | Successful POST requests creating resources |{

| 400 | Bad Request | Validation errors, missing required fields |  "success": true,

| 401 | Unauthorized | Missing or invalid authentication token |  "count": 2,

| 404 | Not Found | Requested resource doesn't exist |  "data": [

| 429 | Too Many Requests | Rate limit exceeded |    {

| 500 | Internal Server Error | Server-side errors |      "dealerId": 1,

      "name": "John Doe",

### Validation Errors      "email": "john@example.com",

      "createdAt": "2025-01-01T00:00:00.000Z",

When request validation fails, the API returns detailed field-level errors:      "updatedAt": "2025-01-01T00:00:00.000Z"

    }

```json  ]

{}

  "error": "Validation failed",```

  "details": [

    {### Get Dealer by ID

      "field": "email",

      "message": "Invalid email"**GET** `/api/dealers/:id`

    },

    {**Response:**

      "field": "password",

      "message": "String must contain at least 6 character(s)"```json

    }{

  ]  "success": true,

}  "data": {

```    "dealerId": 1,

    "name": "John Doe",

---    "email": "john@example.com",

    "createdAt": "2025-01-01T00:00:00.000Z"

## API Endpoints  }

}

## Authentication Endpoints```



### Generate Authentication Token### Register New Dealer



Generates a JWT token for API access using admin credentials.**POST** `/api/dealers`



**Endpoint**: `POST /api/v1/auction/token`**Request Body:**



**Authentication**: Not required```json

{

**Rate Limit**: 5 requests per 15 minutes  "name": "John Doe",

  "email": "john@example.com",

**Request Body**:  "password": "securePassword123"

```json}

{```

  "username": "admin",

  "password": "adminpassword007"**Response (201):**

}

``````json

{

**Field Validation**:  "success": true,

- `username` (string, required): Admin username  "message": "Dealer registered successfully",

- `password` (string, required): Admin password  "data": {

    "dealerId": 1,

**Success Response (200)**:    "name": "John Doe",

```json    "email": "john@example.com",

{    "createdAt": "2025-01-01T00:00:00.000Z"

  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjE3MDAwODYzOTl9.signature"  }

}}

```````

**Error Responses**:### Update Dealer

400 Bad Request - Missing credentials:**PUT** `/api/dealers/:id`

```````json

{**Request Body:**

  "error": "Bad request",

  "message": "Username and password are required"```json

}{

```  "name": "John Updated",

  "email": "john.new@example.com",

401 Unauthorized - Invalid credentials:  "password": "newPassword123"

```json}

{```

  "error": "Unauthorized",

  "message": "Invalid credentials"**Response:**

}

``````json

{

500 Internal Server Error - JWT configuration error:  "success": true,

```json  "message": "Dealer updated successfully",

{  "data": {

  "error": "Internal server error",    "dealerId": 1,

  "message": "JWT_SECRET is not configured"    "name": "John Updated",

}    "email": "john.new@example.com",

```    "updatedAt": "2025-01-02T00:00:00.000Z"

  }

**cURL Example**:}

```bash```

curl -X POST http://localhost:3000/api/v1/auction/token \

  -H "Content-Type: application/json" \### Delete Dealer

  -d '{

    "username": "admin",**DELETE** `/api/dealers/:id`

    "password": "adminpassword007"

  }'**Response:**

```````

````json

---{

  "success": true,

## Car Endpoints  "message": "Dealer deleted successfully"

}

### Get All Cars```



Retrieve a list of all cars in the system.---



**Endpoint**: `GET /api/v1/cars`## Auction Routes



**Authentication**: Required (Bearer Token)### Get All Auctions



**Request Parameters**: None**GET** `/api/auctions`



**Success Response (200)**:**Response:**

```json

{```json

  "success": true,{

  "count": 2,  "success": true,

  "data": [  "count": 2,

    {  "data": [

      "carId": 1,    {

      "make": "Toyota",      "auctionId": 1,

      "model": "Camry",      "carId": 1,

      "year": 2023,      "carMake": "Toyota",

      "createdAt": "2024-10-31T10:00:00.000Z",      "carModel": "Camry",

      "updatedAt": "2024-10-31T10:00:00.000Z"      "carYear": 2022,

    },      "status": "LIVE",

    {      "startingPrice": "15000.00",

      "carId": 2,      "currentHighestBid": "17500.00",

      "make": "Honda",      "startTime": "2025-01-10T10:00:00.000Z",

      "model": "Accord",      "endTime": "2025-01-15T18:00:00.000Z",

      "year": 2022,      "createdAt": "2025-01-05T00:00:00.000Z"

      "createdAt": "2024-10-31T10:05:00.000Z",    }

      "updatedAt": "2024-10-31T10:05:00.000Z"  ]

    }}

  ]```

}

```### Get Active Auctions



**Error Responses**:**GET** `/api/auctions/active`



401 Unauthorized:**Response:**

```json

{```json

  "error": "Unauthorized",{

  "message": "Access denied. No token provided."  "success": true,

}  "count": 1,

```  "data": [

    {

**cURL Example**:      "auctionId": 1,

```bash      "carId": 1,

curl -X GET http://localhost:3000/api/v1/cars \      "carMake": "Toyota",

  -H "Authorization: Bearer <your-token>"      "carModel": "Camry",

```      "carYear": 2022,

      "status": "LIVE",

---      "startingPrice": "15000.00",

      "currentHighestBid": "17500.00",

### Get Car by ID      "startTime": "2025-01-10T10:00:00.000Z",

      "endTime": "2025-01-15T18:00:00.000Z"

Retrieve details of a specific car by its ID.    }

  ]

**Endpoint**: `GET /api/v1/cars/:id`}

````

**Authentication**: Required (Bearer Token)

### Get Auction by ID (with bids)

**URL Parameters**:

- `id` (integer, required): Car ID**GET** `/api/auctions/:id`

**Success Response (200)**:**Response:**

````json

{```json

  "success": true,{

  "data": {  "success": true,

    "carId": 1,  "data": {

    "make": "Toyota",    "auctionId": 1,

    "model": "Camry",    "carId": 1,

    "year": 2023,    "car": {

    "createdAt": "2024-10-31T10:00:00.000Z",      "carId": 1,

    "updatedAt": "2024-10-31T10:00:00.000Z"      "make": "Toyota",

  }      "model": "Camry",

}      "year": 2022

```    },

    "status": "LIVE",

**Error Responses**:    "startingPrice": "15000.00",

    "currentHighestBid": "17500.00",

400 Bad Request - Invalid ID format:    "startTime": "2025-01-10T10:00:00.000Z",

```json    "endTime": "2025-01-15T18:00:00.000Z",

{    "winnerBidId": null,

  "error": "Bad request",    "createdAt": "2025-01-05T00:00:00.000Z",

  "message": "Invalid car ID"    "bids": [

}      {

```        "bidId": 2,

        "dealerId": 1,

404 Not Found - Car doesn't exist:        "dealerName": "John Doe",

```json        "bidAmount": "17500.00",

{        "timePlaced": "2025-01-11T14:30:00.000Z"

  "error": "Not found",      }

  "message": "Car not found"    ]

}  }

```}

````

**cURL Example**:

```bash### Get Highest Bid

curl -X GET http://localhost:3000/api/v1/cars/1 \

  -H "Authorization: Bearer <your-token>"**GET** `/api/auctions/:id/highest-bid`

```

**Response:**

---

````json

### Create Car{

  "success": true,

Add a new car to the system.  "data": {

    "bidId": 2,

**Endpoint**: `POST /api/v1/cars`    "dealerId": 1,

    "dealerName": "John Doe",

**Authentication**: Required (Bearer Token)    "bidAmount": "17500.00",

    "timePlaced": "2025-01-11T14:30:00.000Z"

**Request Body**:  }

```json}

{```

  "make": "Toyota",

  "model": "Camry",### Get Auction Winner

  "year": 2023

}**GET** `/api/auctions/:id/winner`

````

**Response:**

**Field Validation**:

- `make` (string, required): Car manufacturer (1-50 characters)```json

- `model` (string, required): Car model (1-50 characters){

- `year` (integer, required): Manufacturing year (1900-2100) "success": true,

  "data": {

**Success Response (201)**: "auctionId": 1,

````json "winner": {

{      "bidId": 2,

  "success": true,      "dealerId": 1,

  "message": "Car created successfully",      "dealerName": "John Doe",

  "data": {      "dealerEmail": "john@example.com",

    "carId": 1,      "bidAmount": "17500.00",

    "make": "Toyota",      "timePlaced": "2025-01-11T14:30:00.000Z"

    "model": "Camry",    }

    "year": 2023,  }

    "createdAt": "2024-10-31T10:00:00.000Z",}

    "updatedAt": "2024-10-31T10:00:00.000Z"```

  }

}### Create New Auction

````

**POST** `/api/auctions`

**Error Responses**:

**Request Body:**

400 Bad Request - Validation error:

`json`json

{{

"error": "Validation failed", "carId": 1,

"details": [ "startTime": "2025-01-10T10:00:00.000Z",

    {  "endTime": "2025-01-15T18:00:00.000Z",

      "field": "year",  "startingPrice": 15000,

      "message": "Number must be less than or equal to 2100"  "createdBy": 1

    }}

]```

}

```````**Response (201):**



**cURL Example**:```json

```bash{

curl -X POST http://localhost:3000/api/v1/cars \  "success": true,

  -H "Authorization: Bearer <your-token>" \  "message": "Auction created successfully",

  -H "Content-Type: application/json" \  "data": {

  -d '{    "auctionId": 1,

    "make": "Toyota",    "carId": 1,

    "model": "Camry",    "status": "DRAFT",

    "year": 2023    "startingPrice": "15000.00",

  }'    "startTime": "2025-01-10T10:00:00.000Z",

```    "endTime": "2025-01-15T18:00:00.000Z",

    "createdAt": "2025-01-05T00:00:00.000Z"

---  }

}

### Update Car```



Update an existing car's information.### Update Auction



**Endpoint**: `PUT /api/v1/cars/:id`**PUT** `/api/auctions/:id`



**Authentication**: Required (Bearer Token)**Request Body:**



**URL Parameters**:```json

- `id` (integer, required): Car ID{

  "startTime": "2025-01-12T10:00:00.000Z",

**Request Body** (all fields optional):  "endTime": "2025-01-17T18:00:00.000Z",

```json  "startingPrice": 16000

{}

  "make": "Toyota",```

  "model": "Camry Hybrid",

  "year": 2024**Response:**

}

``````json

{

**Field Validation**:  "success": true,

- `make` (string, optional): Car manufacturer (1-50 characters)  "message": "Auction updated successfully",

- `model` (string, optional): Car model (1-50 characters)  "data": {

- `year` (integer, optional): Manufacturing year (1900-2100)    "auctionId": 1,

    "startTime": "2025-01-12T10:00:00.000Z",

**Success Response (200)**:    "endTime": "2025-01-17T18:00:00.000Z",

```json    "startingPrice": "16000.00",

{    "updatedAt": "2025-01-06T00:00:00.000Z"

  "success": true,  }

  "message": "Car updated successfully",}

  "data": {```

    "carId": 1,

    "make": "Toyota",### Update Auction Status

    "model": "Camry Hybrid",

    "year": 2024,**PATCH** `/api/auctions/:id/status`

    "createdAt": "2024-10-31T10:00:00.000Z",

    "updatedAt": "2024-10-31T12:00:00.000Z"**Request Body:**

  }

}```json

```{

  "status": "LIVE"

**Error Responses**:}

```````

400 Bad Request - No fields to update:

````json**Valid Status Transitions:**

{

  "error": "Bad request",- DRAFT → LIVE, CANCELLED

  "message": "No fields to update"- LIVE → ENDED, CANCELLED

}- ENDED → CLOSED

```- CLOSED → (final state)

- CANCELLED → (final state)

400 Bad Request - Invalid year:

```json**Response:**

{

  "error": "Bad request",```json

  "message": "Invalid year"{

}  "success": true,

```  "message": "Auction status updated to LIVE",

  "data": {

404 Not Found:    "auctionId": 1,

```json    "status": "LIVE",

{    "updatedAt": "2025-01-10T10:00:00.000Z"

  "error": "Not found",  }

  "message": "Car not found"}

}```

````

### Delete Auction

**cURL Example**:

```bash**DELETE** `/api/auctions/:id`

curl -X PUT http://localhost:3000/api/v1/cars/1 \

-H "Authorization: Bearer <your-token>" \*\*Response:\*\*

-H "Content-Type: application/json" \

-d '{```json

    "model": "Camry Hybrid"{

}' "success": true,

````"message": "Auction deleted successfully"

}

---```



### Delete Car---



Remove a car from the system.## Bid Routes



**Endpoint**: `DELETE /api/v1/cars/:id`### Get All Bids



**Authentication**: Required (Bearer Token)**GET** `/api/bids`



**URL Parameters**:**Response:**

- `id` (integer, required): Car ID

```json

**Success Response (200)**:{

```json  "success": true,

{  "count": 3,

  "success": true,  "data": [

  "message": "Car deleted successfully"    {

}      "bidId": 1,

```      "auctionId": 1,

      "dealerId": 1,

**Error Responses**:      "dealerName": "John Doe",

      "bidAmount": "17500.00",

400 Bad Request:      "previousBid": "16000.00",

```json      "timePlaced": "2025-01-11T14:30:00.000Z"

{    }

  "error": "Bad request",  ]

  "message": "Invalid car ID"}

}```

````

### Get Bid by ID

404 Not Found:

```json**GET** `/api/bids/:id`

{

"error": "Not found",**Response:**

"message": "Car not found"

}```json

```````{

  "success": true,

**cURL Example**:  "data": {

```bash    "bidId": 1,

curl -X DELETE http://localhost:3000/api/v1/cars/1 \    "auctionId": 1,

  -H "Authorization: Bearer <your-token>"    "dealerId": 1,

```    "dealerName": "John Doe",

    "bidAmount": "17500.00",

---    "previousBid": "16000.00",

    "timePlaced": "2025-01-11T14:30:00.000Z"

## Dealer Endpoints  }

}

### Get All Dealers```



Retrieve a list of all registered dealers (excludes password hashes).### Get Bids for Auction



**Endpoint**: `GET /api/v1/dealers`**GET** `/api/auctions/:auctionId/bids`



**Authentication**: Required (Bearer Token)**Response:**



**Request Parameters**: None```json

{

**Success Response (200)**:  "success": true,

```json  "auctionId": 1,

{  "count": 2,

  "success": true,  "data": [

  "count": 2,    {

  "data": [      "bidId": 2,

    {      "dealerId": 1,

      "dealerId": 1,      "dealerName": "John Doe",

      "name": "John's Auto Sales",      "bidAmount": "17500.00",

      "email": "john@autosales.com",      "previousBid": "16000.00",

      "createdAt": "2024-10-31T10:00:00.000Z",      "timePlaced": "2025-01-11T14:30:00.000Z"

      "updatedAt": "2024-10-31T10:00:00.000Z"    }

    },  ]

    {}

      "dealerId": 2,```

      "name": "Premium Motors",

      "email": "info@premiummotors.com",### Get Dealer's Bids

      "createdAt": "2024-10-31T10:15:00.000Z",

      "updatedAt": "2024-10-31T10:15:00.000Z"**GET** `/api/dealers/:id/bids`

    }

  ]**Response:**

}

``````json

{

**Note**: Password hashes are never included in response data for security.  "success": true,

  "dealerId": 1,

**cURL Example**:  "dealerName": "John Doe",

```bash  "count": 3,

curl -X GET http://localhost:3000/api/v1/dealers \  "data": [

  -H "Authorization: Bearer <your-token>"    {

```      "bidId": 1,

      "auctionId": 1,

---      "bidAmount": "17500.00",

      "previousBid": "16000.00",

### Get Dealer by ID      "timePlaced": "2025-01-11T14:30:00.000Z"

    }

Retrieve details of a specific dealer by ID.  ]

}

**Endpoint**: `GET /api/v1/dealers/:id````



**Authentication**: Required (Bearer Token)### Place New Bid



**URL Parameters**:**POST** `/api/auctions/:auctionId/bids`

- `id` (integer, required): Dealer ID

**Request Body:**

**Success Response (200)**:

```json```json

{{

  "success": true,  "dealerId": 1,

  "data": {  "amount": 17500

    "dealerId": 1,}

    "name": "John's Auto Sales",```

    "email": "john@autosales.com",

    "createdAt": "2024-10-31T10:00:00.000Z",**Validation Rules:**

    "updatedAt": "2024-10-31T10:00:00.000Z"

  }- Auction must be in LIVE status

}- Dealer must exist

```- Bid amount must be greater than current highest bid (or starting price if no bids)



**Error Responses**:**Response (201):**



400 Bad Request:```json

```json{

{  "success": true,

  "error": "Bad request",  "message": "Bid placed successfully",

  "message": "Invalid dealer ID"  "data": {

}    "bidId": 1,

```    "auctionId": 1,

    "dealerId": 1,

404 Not Found:    "bidAmount": "17500.00",

```json    "previousBid": "16000.00",

{    "timePlaced": "2025-01-11T14:30:00.000Z"

  "error": "Not found",  }

  "message": "Dealer not found"}

}```

```````

### Update Bid

**cURL Example**:

```bash**PUT** `/api/bids/:id`

curl -X GET http://localhost:3000/api/v1/dealers/1 \

-H "Authorization: Bearer <your-token>"**Request Body:**

````

```json

---{

  "amount": 18000

### Register Dealer}

````

Register a new dealer in the system.

**Response:**

**Endpoint**: `POST /api/v1/dealers/register`

````json

**Authentication**: Required (Bearer Token){

  "success": true,

**Request Body**:  "message": "Bid updated successfully",

```json  "data": {

{    "bidId": 1,

  "name": "John's Auto Sales",    "bidAmount": "18000.00"

  "email": "john@autosales.com",  }

  "password": "securePassword123"}

}```

````

### Delete Bid

**Field Validation**:

- `name` (string, required): Dealer name (1-100 characters)**DELETE** `/api/bids/:id`

- `email` (string, required): Valid email format (max 100 characters)

- `password` (string, required): Minimum 6 characters**Response:**

**Password Security**:```json

- Hashed using bcrypt with 10 salt rounds{

- Original password is never stored "success": true,

- Password hash is never returned in API responses "message": "Bid deleted successfully"

}

**Success Response (201)**:```

````json

{---

  "success": true,

  "message": "Dealer registered successfully",## Error Responses

  "data": {

    "dealerId": 1,All endpoints return consistent error responses:

    "name": "John's Auto Sales",

    "email": "john@autosales.com",### 400 Bad Request

    "createdAt": "2024-10-31T10:00:00.000Z"

  }```json

}{

```  "error": "Bad request",

  "message": "Specific error message"

**Error Responses**:}

````

400 Bad Request - Email already exists:

````json### 401 Unauthorized

{

  "error": "Bad request",```json

  "message": "Email already registered"{

}  "error": "Unauthorized",

```  "message": "No token provided or invalid format"

}

400 Bad Request - Validation error:```

```json

{### 404 Not Found

  "error": "Validation failed",

  "details": [```json

    {{

      "field": "email",  "error": "Not found",

      "message": "Invalid email"  "message": "Resource not found"

    },}

    {```

      "field": "password",

      "message": "String must contain at least 6 character(s)"### 500 Internal Server Error

    }

  ]```json

}{

```  "error": "Internal server error",

  "message": "Failed to perform operation"

**cURL Example**:}

```bash```

curl -X POST http://localhost:3000/api/v1/dealers/register \

  -H "Authorization: Bearer <your-token>" \---

  -H "Content-Type: application/json" \

  -d '{## Testing with Postman/cURL

    "name": "John'\''s Auto Sales",

    "email": "john@autosales.com",### 1. Get Token

    "password": "securePassword123"

  }'```bash

```curl -X POST http://localhost:3000/api/v1/auction/token \

  -H "Content-Type: application/json" \

---  -d '{"username":"Admin","password":"Admin"}'

````

### Update Dealer

### 2. Use Token in Requests

Update an existing dealer's information.

````bash

**Endpoint**: `PUT /api/v1/dealers/:id`curl -X GET http://localhost:3000/api/cars \

  -H "Authorization: Bearer YOUR_TOKEN_HERE"

**Authentication**: Required (Bearer Token)```



**URL Parameters**:### 3. Create a Car

- `id` (integer, required): Dealer ID

```bash

**Request Body** (all fields optional):curl -X POST http://localhost:3000/api/cars \

```json  -H "Authorization: Bearer YOUR_TOKEN_HERE" \

{  -H "Content-Type: application/json" \

  "name": "John's Premium Auto Sales",  -d '{"make":"Toyota","model":"Camry","year":2022}'

  "email": "john.premium@autosales.com",```

  "password": "newSecurePassword456"

}---

````

## Environment Variables

**Field Validation**:

- `name` (string, optional): Dealer name (1-100 characters)Create a `.env` file in the root directory:

- `email` (string, optional): Valid email format, must be unique

- `password` (string, optional): Minimum 6 characters (will be hashed)```env

DATABASE_URL=your_database_url_here

**Success Response (200)**:JWT_SECRET=secretkey

````jsonPORT=3000

{```

  "success": true,
  "message": "Dealer updated successfully",
  "data": {
    "dealerId": 1,
    "name": "John's Premium Auto Sales",
    "email": "john.premium@autosales.com",
    "updatedAt": "2024-10-31T12:00:00.000Z"
  }
}
````

**Error Responses**:

400 Bad Request - No fields provided:

```json
{
  "error": "Bad request",
  "message": "No fields to update"
}
```

400 Bad Request - Invalid email format:

```json
{
  "error": "Bad request",
  "message": "Invalid email format"
}
```

400 Bad Request - Email in use:

```json
{
  "error": "Bad request",
  "message": "Email already in use"
}
```

404 Not Found:

```json
{
  "error": "Not found",
  "message": "Dealer not found"
}
```

**cURL Example**:

```bash
curl -X PUT http://localhost:3000/api/v1/dealers/1 \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John'\''s Premium Auto Sales"
  }'
```

---

### Delete Dealer

Remove a dealer from the system.

**Endpoint**: `DELETE /api/v1/dealers/:id`

**Authentication**: Required (Bearer Token)

**URL Parameters**:

- `id` (integer, required): Dealer ID

**Success Response (200)**:

```json
{
  "success": true,
  "message": "Dealer deleted successfully"
}
```

**Error Responses**:

400 Bad Request:

```json
{
  "error": "Bad request",
  "message": "Invalid dealer ID"
}
```

404 Not Found:

```json
{
  "error": "Not found",
  "message": "Dealer not found"
}
```

**cURL Example**:

```bash
curl -X DELETE http://localhost:3000/api/v1/dealers/1 \
  -H "Authorization: Bearer <your-token>"
```

---

## Auction Endpoints

### Get All Auctions

Retrieve a list of all auctions with associated car details.

**Endpoint**: `GET /api/v1/auctions`

**Authentication**: Required (Bearer Token)

**Request Parameters**: None

**Success Response (200)**:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "auctionId": 1,
      "carId": 1,
      "carMake": "Toyota",
      "carModel": "Camry",
      "carYear": 2023,
      "status": "LIVE",
      "startingPrice": "15000.00",
      "currentHighestBid": "17500.00",
      "startTime": "2024-10-31T10:00:00.000Z",
      "endTime": "2024-11-01T10:00:00.000Z",
      "createdAt": "2024-10-31T09:00:00.000Z"
    },
    {
      "auctionId": 2,
      "carId": 2,
      "carMake": "Honda",
      "carModel": "Accord",
      "carYear": 2022,
      "status": "DRAFT",
      "startingPrice": "14000.00",
      "currentHighestBid": null,
      "startTime": "2024-11-02T10:00:00.000Z",
      "endTime": "2024-11-03T10:00:00.000Z",
      "createdAt": "2024-10-31T09:30:00.000Z"
    }
  ]
}
```

**Auction Status Values**:

- `DRAFT`: Auction created but not yet live
- `LIVE`: Auction is currently active and accepting bids
- `ENDED`: Auction time period has ended
- `CLOSED`: Auction is finalized with winner determined
- `CANCELLED`: Auction was cancelled before completion

**cURL Example**:

```bash
curl -X GET http://localhost:3000/api/v1/auctions \
  -H "Authorization: Bearer <your-token>"
```

---

### Get Active Auctions

Retrieve only auctions that are currently live and accepting bids.

**Endpoint**: `GET /api/v1/auctions/active`

**Authentication**: Required (Bearer Token)

**Request Parameters**: None

**Filtering Logic**:

- Status must be "LIVE"
- Current time must be between startTime and endTime

**Success Response (200)**:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "auctionId": 1,
      "carId": 1,
      "carMake": "Toyota",
      "carModel": "Camry",
      "carYear": 2023,
      "status": "LIVE",
      "startingPrice": "15000.00",
      "currentHighestBid": "17500.00",
      "startTime": "2024-10-31T10:00:00.000Z",
      "endTime": "2024-11-01T10:00:00.000Z"
    }
  ]
}
```

**cURL Example**:

```bash
curl -X GET http://localhost:3000/api/v1/auctions/active \
  -H "Authorization: Bearer <your-token>"
```

---

### Get Auction by ID

Retrieve detailed information about a specific auction including all bids.

**Endpoint**: `GET /api/v1/auctions/:id`

**Authentication**: Required (Bearer Token)

**URL Parameters**:

- `id` (integer, required): Auction ID

**Success Response (200)**:

```json
{
  "success": true,
  "data": {
    "auctionId": 1,
    "carId": 1,
    "car": {
      "carId": 1,
      "make": "Toyota",
      "model": "Camry",
      "year": 2023
    },
    "status": "LIVE",
    "startingPrice": "15000.00",
    "currentHighestBid": "17500.00",
    "startTime": "2024-10-31T10:00:00.000Z",
    "endTime": "2024-11-01T10:00:00.000Z",
    "winnerBidId": null,
    "createdAt": "2024-10-31T09:00:00.000Z",
    "bids": [
      {
        "bidId": 3,
        "dealerId": 2,
        "dealerName": "Premium Motors",
        "bidAmount": "17500.00",
        "timePlaced": "2024-10-31T11:30:00.000Z"
      },
      {
        "bidId": 2,
        "dealerId": 1,
        "dealerName": "John's Auto Sales",
        "bidAmount": "16500.00",
        "timePlaced": "2024-10-31T11:00:00.000Z"
      },
      {
        "bidId": 1,
        "dealerId": 1,
        "dealerName": "John's Auto Sales",
        "bidAmount": "15500.00",
        "timePlaced": "2024-10-31T10:30:00.000Z"
      }
    ]
  }
}
```

**Note**: Bids are sorted by amount in descending order (highest first).

**Error Responses**:

400 Bad Request:

```json
{
  "error": "Bad request",
  "message": "Invalid auction ID"
}
```

404 Not Found:

```json
{
  "error": "Not found",
  "message": "Auction not found"
}
```

**cURL Example**:

```bash
curl -X GET http://localhost:3000/api/v1/auctions/1 \
  -H "Authorization: Bearer <your-token>"
```

---

### Get Highest Bid for Auction

Retrieve the current highest bid for a specific auction.

**Endpoint**: `GET /api/v1/auctions/:id/highest-bid`

**Authentication**: Required (Bearer Token)

**URL Parameters**:

- `id` (integer, required): Auction ID

**Success Response (200)**:

```json
{
  "success": true,
  "data": {
    "bidId": 3,
    "dealerId": 2,
    "dealerName": "Premium Motors",
    "bidAmount": "17500.00",
    "timePlaced": "2024-10-31T11:30:00.000Z"
  }
}
```

**Error Responses**:

400 Bad Request:

```json
{
  "error": "Bad request",
  "message": "Invalid auction ID"
}
```

404 Not Found - No bids placed:

```json
{
  "error": "Not found",
  "message": "No bids found for this auction"
}
```

**cURL Example**:

```bash
curl -X GET http://localhost:3000/api/v1/auctions/1/highest-bid \
  -H "Authorization: Bearer <your-token>"
```

---

### Get Auction Winner

Retrieve the winner of a closed auction.

**Endpoint**: `GET /api/v1/auctions/:id/winner`

**Authentication**: Required (Bearer Token)

**URL Parameters**:

- `id` (integer, required): Auction ID

**Requirements**:

- Auction status must be "ENDED" or "CLOSED"
- Winner must be determined (winnerBidId must exist)

**Success Response (200)**:

```json
{
  "success": true,
  "data": {
    "auctionId": 1,
    "winner": {
      "bidId": 3,
      "dealerId": 2,
      "dealerName": "Premium Motors",
      "dealerEmail": "info@premiummotors.com",
      "bidAmount": "17500.00",
      "timePlaced": "2024-10-31T11:30:00.000Z"
    }
  }
}
```

**Error Responses**:

400 Bad Request - Auction not closed:

```json
{
  "error": "Bad request",
  "message": "Auction is not closed yet"
}
```

404 Not Found - No winner determined:

```json
{
  "error": "Not found",
  "message": "No winner determined for this auction"
}
```

**cURL Example**:

```bash
curl -X GET http://localhost:3000/api/v1/auctions/1/winner \
  -H "Authorization: Bearer <your-token>"
```

---

### Create Auction

Create a new auction for a car.

**Endpoint**: `POST /api/v1/auctions`

**Authentication**: Required (Bearer Token)

**Request Body**:

```json
{
  "carId": 1,
  "startTime": "2024-11-01T10:00:00.000Z",
  "endTime": "2024-11-02T10:00:00.000Z",
  "startingPrice": 15000,
  "createdBy": 1
}
```

**Field Validation**:

- `carId` (integer, required): Must reference an existing car
- `startTime` (ISO 8601 date string, required): Auction start date/time
- `endTime` (ISO 8601 date string, optional): Auction end date/time
- `startingPrice` (number, required): Minimum bid amount (positive)
- `createdBy` (integer, optional): Creator's dealer ID

**Business Rules**:

- Car must exist in the system
- End time must be after start time (if provided)
- New auctions are created with status "DRAFT"

**Success Response (201)**:

```json
{
  "success": true,
  "message": "Auction created successfully",
  "data": {
    "auctionId": 1,
    "carId": 1,
    "startTime": "2024-11-01T10:00:00.000Z",
    "endTime": "2024-11-02T10:00:00.000Z",
    "startingPrice": "15000.00",
    "currentHighestBid": null,
    "status": "DRAFT",
    "winnerBidId": null,
    "createdBy": 1,
    "createdAt": "2024-10-31T10:00:00.000Z",
    "updatedAt": "2024-10-31T10:00:00.000Z"
  }
}
```

**Error Responses**:

400 Bad Request - Invalid time range:

```json
{
  "error": "Bad request",
  "message": "End time must be after start time"
}
```

404 Not Found - Car doesn't exist:

```json
{
  "error": "Not found",
  "message": "Car not found"
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:3000/api/v1/auctions \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "carId": 1,
    "startTime": "2024-11-01T10:00:00.000Z",
    "endTime": "2024-11-02T10:00:00.000Z",
    "startingPrice": 15000
  }'
```

---

### Update Auction

Update an existing auction's details.

**Endpoint**: `PUT /api/v1/auctions/:id`

**Authentication**: Required (Bearer Token)

**URL Parameters**:

- `id` (integer, required): Auction ID

**Request Body** (all fields optional):

```json
{
  "carId": 2,
  "startTime": "2024-11-01T11:00:00.000Z",
  "endTime": "2024-11-02T11:00:00.000Z",
  "startingPrice": 16000
}
```

**Field Validation**:

- `carId` (integer, optional): Must reference an existing car
- `startTime` (ISO 8601 date string, optional): New start date/time
- `endTime` (ISO 8601 date string, optional): New end date/time
- `startingPrice` (number, optional): New starting price

**Business Rules**:

- Cannot update auctions with status "LIVE" or "ENDED"
- Only auctions in "DRAFT" status can be updated
- Car must exist if carId is being changed

**Success Response (200)**:

```json
{
  "success": true,
  "message": "Auction updated successfully",
  "data": {
    "auctionId": 1,
    "carId": 2,
    "startTime": "2024-11-01T11:00:00.000Z",
    "endTime": "2024-11-02T11:00:00.000Z",
    "startingPrice": "16000.00",
    "currentHighestBid": null,
    "status": "DRAFT",
    "updatedAt": "2024-10-31T12:00:00.000Z"
  }
}
```

**Error Responses**:

400 Bad Request - Cannot update active auction:

```json
{
  "error": "Bad request",
  "message": "Cannot update active or ended auction"
}
```

400 Bad Request - No fields provided:

```json
{
  "error": "Bad request",
  "message": "No fields to update"
}
```

404 Not Found:

```json
{
  "error": "Not found",
  "message": "Auction not found"
}
```

**cURL Example**:

```bash
curl -X PUT http://localhost:3000/api/v1/auctions/1 \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startingPrice": 16000
  }'
```

---

### Update Auction Status

Change the status of an auction (e.g., from DRAFT to LIVE, LIVE to ENDED).

**Endpoint**: `PATCH /api/v1/auctions/:id/status`

**Authentication**: Required (Bearer Token)

**URL Parameters**:

- `id` (integer, required): Auction ID

**Request Body**:

```json
{
  "status": "LIVE"
}
```

**Field Validation**:

- `status` (string, required): Must be one of: DRAFT, LIVE, ENDED, CLOSED, CANCELLED

**Valid Status Transitions**:

```
DRAFT -> LIVE or CANCELLED
LIVE -> ENDED or CANCELLED
ENDED -> CLOSED
CLOSED -> (no transitions allowed)
CANCELLED -> (no transitions allowed)
```

**Special Behavior**:

- When transitioning from LIVE to ENDED or CLOSED:
  - System automatically determines the winner (highest bid)
  - Sets `winnerBidId` field
  - Updates `currentHighestBid` with winning amount

**Success Response (200)**:

```json
{
  "success": true,
  "message": "Auction status updated to LIVE",
  "data": {
    "auctionId": 1,
    "carId": 1,
    "status": "LIVE",
    "startingPrice": "15000.00",
    "currentHighestBid": null,
    "winnerBidId": null,
    "updatedAt": "2024-10-31T12:00:00.000Z"
  }
}
```

**Success Response (200) - Closing auction with winner**:

```json
{
  "success": true,
  "message": "Auction status updated to CLOSED",
  "data": {
    "auctionId": 1,
    "carId": 1,
    "status": "CLOSED",
    "startingPrice": "15000.00",
    "currentHighestBid": "17500.00",
    "winnerBidId": 3,
    "updatedAt": "2024-10-31T12:00:00.000Z"
  }
}
```

**Error Responses**:

400 Bad Request - Missing status:

```json
{
  "error": "Bad request",
  "message": "Status is required"
}
```

400 Bad Request - Invalid status value:

```json
{
  "error": "Bad request",
  "message": "Invalid status. Must be one of: DRAFT, LIVE, ENDED, CLOSED, CANCELLED"
}
```

400 Bad Request - Invalid transition:

```json
{
  "error": "Bad request",
  "message": "Cannot transition from LIVE to DRAFT"
}
```

404 Not Found:

```json
{
  "error": "Not found",
  "message": "Auction not found"
}
```

**cURL Example**:

```bash
curl -X PATCH http://localhost:3000/api/v1/auctions/1/status \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "LIVE"
  }'
```

---

### Delete Auction

Remove an auction from the system.

**Endpoint**: `DELETE /api/v1/auctions/:id`

**Authentication**: Required (Bearer Token)

**URL Parameters**:

- `id` (integer, required): Auction ID

**Business Rules**:

- Cannot delete auctions with status "LIVE"
- Only draft, ended, closed, or cancelled auctions can be deleted

**Success Response (200)**:

```json
{
  "success": true,
  "message": "Auction deleted successfully"
}
```

**Error Responses**:

400 Bad Request - Active auction:

```json
{
  "error": "Bad request",
  "message": "Cannot delete active auction"
}
```

404 Not Found:

```json
{
  "error": "Not found",
  "message": "Auction not found"
}
```

**cURL Example**:

```bash
curl -X DELETE http://localhost:3000/api/v1/auctions/1 \
  -H "Authorization: Bearer <your-token>"
```

---

## Bid Endpoints

### Get All Bids

Retrieve a list of all bids across all auctions.

**Endpoint**: `GET /api/v1/bids`

**Authentication**: Required (Bearer Token)

**Request Parameters**: None

**Success Response (200)**:

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "bidId": 3,
      "auctionId": 1,
      "dealerId": 2,
      "dealerName": "Premium Motors",
      "bidAmount": "17500.00",
      "previousBid": "16500.00",
      "timePlaced": "2024-10-31T11:30:00.000Z"
    },
    {
      "bidId": 2,
      "auctionId": 1,
      "dealerId": 1,
      "dealerName": "John's Auto Sales",
      "bidAmount": "16500.00",
      "previousBid": "15500.00",
      "timePlaced": "2024-10-31T11:00:00.000Z"
    },
    {
      "bidId": 1,
      "auctionId": 1,
      "dealerId": 1,
      "dealerName": "John's Auto Sales",
      "bidAmount": "15500.00",
      "previousBid": null,
      "timePlaced": "2024-10-31T10:30:00.000Z"
    }
  ]
}
```

**Note**: Results are sorted by time placed in descending order (most recent first).

**cURL Example**:

```bash
curl -X GET http://localhost:3000/api/v1/bids \
  -H "Authorization: Bearer <your-token>"
```

---

### Get Bid by ID

Retrieve details of a specific bid.

**Endpoint**: `GET /api/v1/bids/:id`

**Authentication**: Required (Bearer Token)

**URL Parameters**:

- `id` (integer, required): Bid ID

**Success Response (200)**:

```json
{
  "success": true,
  "data": {
    "bidId": 3,
    "auctionId": 1,
    "dealerId": 2,
    "dealerName": "Premium Motors",
    "bidAmount": "17500.00",
    "previousBid": "16500.00",
    "timePlaced": "2024-10-31T11:30:00.000Z"
  }
}
```

**Error Responses**:

400 Bad Request:

```json
{
  "error": "Bad request",
  "message": "Invalid bid ID"
}
```

404 Not Found:

```json
{
  "error": "Not found",
  "message": "Bid not found"
}
```

**cURL Example**:

```bash
curl -X GET http://localhost:3000/api/v1/bids/3 \
  -H "Authorization: Bearer <your-token>"
```

---

### Get Bids for Auction

Retrieve all bids for a specific auction.

**Endpoint**: `GET /api/v1/auctions/:auctionId/bids`

**Authentication**: Required (Bearer Token)

**URL Parameters**:

- `auctionId` (integer, required): Auction ID

**Success Response (200)**:

```json
{
  "success": true,
  "auctionId": 1,
  "count": 3,
  "data": [
    {
      "bidId": 3,
      "dealerId": 2,
      "dealerName": "Premium Motors",
      "bidAmount": "17500.00",
      "previousBid": "16500.00",
      "timePlaced": "2024-10-31T11:30:00.000Z"
    },
    {
      "bidId": 2,
      "dealerId": 1,
      "dealerName": "John's Auto Sales",
      "bidAmount": "16500.00",
      "previousBid": "15500.00",
      "timePlaced": "2024-10-31T11:00:00.000Z"
    },
    {
      "bidId": 1,
      "dealerId": 1,
      "dealerName": "John's Auto Sales",
      "bidAmount": "15500.00",
      "previousBid": null,
      "timePlaced": "2024-10-31T10:30:00.000Z"
    }
  ]
}
```

**Note**: Bids are sorted by amount in descending order (highest first).

**Error Responses**:

400 Bad Request:

```json
{
  "error": "Bad request",
  "message": "Invalid auction ID"
}
```

404 Not Found:

```json
{
  "error": "Not found",
  "message": "Auction not found"
}
```

**cURL Example**:

```bash
curl -X GET http://localhost:3000/api/v1/auctions/1/bids \
  -H "Authorization: Bearer <your-token>"
```

---

### Get Bids by Dealer

Retrieve all bids placed by a specific dealer.

**Endpoint**: `GET /api/v1/dealers/:id/bids`

**Authentication**: Required (Bearer Token)

**URL Parameters**:

- `id` (integer, required): Dealer ID

**Success Response (200)**:

```json
{
  "success": true,
  "dealerId": 1,
  "dealerName": "John's Auto Sales",
  "count": 2,
  "data": [
    {
      "bidId": 2,
      "auctionId": 1,
      "bidAmount": "16500.00",
      "previousBid": "15500.00",
      "timePlaced": "2024-10-31T11:00:00.000Z"
    },
    {
      "bidId": 1,
      "auctionId": 1,
      "bidAmount": "15500.00",
      "previousBid": null,
      "timePlaced": "2024-10-31T10:30:00.000Z"
    }
  ]
}
```

**Note**: Bids are sorted by time placed in descending order (most recent first).

**Error Responses**:

400 Bad Request:

```json
{
  "error": "Bad request",
  "message": "Invalid dealer ID"
}
```

404 Not Found:

```json
{
  "error": "Not found",
  "message": "Dealer not found"
}
```

**cURL Example**:

```bash
curl -X GET http://localhost:3000/api/v1/dealers/1/bids \
  -H "Authorization: Bearer <your-token>"
```

---

### Place Bid

Place a bid on a live auction.

**Endpoint**: `POST /api/v1/auctions/:auctionId/bids`

**Authentication**: Required (Bearer Token)

**Rate Limit**: 10 requests per 1 minute (strict rate limiting)

**URL Parameters**:

- `auctionId` (integer, required): Auction ID

**Request Body**:

```json
{
  "dealerId": 1,
  "amount": 16500
}
```

**Field Validation**:

- `dealerId` (integer, required): Must be a positive integer and exist
- `amount` (number, required): Must be positive and greater than current highest bid

**Business Rules**:

- Auction must exist
- Auction status must be "LIVE"
- Dealer must exist in the system
- Bid amount must be greater than:
  - Current highest bid (if any bids exist)
  - Starting price (if no bids exist)

**Bid Chain Tracking**:

- System tracks previous highest bid in `previousBid` field
- Creates chain of bid history for audit purposes

**Success Response (201)**:

```json
{
  "success": true,
  "message": "Bid placed successfully",
  "data": {
    "bidId": 3,
    "auctionId": 1,
    "dealerId": 1,
    "bidAmount": "16500.00",
    "previousBid": "15500.00",
    "timePlaced": "2024-10-31T11:00:00.000Z"
  }
}
```

**Error Responses**:

400 Bad Request - Invalid auction ID:

```json
{
  "error": "Bad request",
  "message": "Invalid auction ID"
}
```

400 Bad Request - Auction not live:

```json
{
  "error": "Bad request",
  "message": "Auction is not open for bidding (current status: DRAFT)"
}
```

400 Bad Request - Bid too low:

```json
{
  "error": "Bad request",
  "message": "Bid amount must be greater than current highest bid (15500)"
}
```

404 Not Found - Auction doesn't exist:

```json
{
  "error": "Not found",
  "message": "Auction not found"
}
```

404 Not Found - Dealer doesn't exist:

```json
{
  "error": "Not found",
  "message": "Dealer not found"
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:3000/api/v1/auctions/1/bids \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "dealerId": 1,
    "amount": 16500
  }'
```

---

### Update Bid

Update the amount of an existing bid.

**Endpoint**: `PUT /api/v1/bids/:id`

**Authentication**: Required (Bearer Token)

**URL Parameters**:

- `id` (integer, required): Bid ID

**Request Body**:

```json
{
  "amount": 17000
}
```

**Field Validation**:

- `amount` (number, required): Must be positive

**Business Rules**:

- Bid must exist
- Associated auction must be in "LIVE" status
- Cannot update bids for closed or ended auctions

**Success Response (200)**:

```json
{
  "success": true,
  "message": "Bid updated successfully",
  "data": {
    "bidId": 3,
    "auctionId": 1,
    "dealerId": 1,
    "bidAmount": "17000.00",
    "previousBid": "15500.00",
    "timePlaced": "2024-10-31T11:00:00.000Z"
  }
}
```

**Error Responses**:

400 Bad Request - Missing amount:

```json
{
  "error": "Bad request",
  "message": "Amount is required"
}
```

400 Bad Request - Invalid amount:

```json
{
  "error": "Bad request",
  "message": "Invalid bid amount"
}
```

400 Bad Request - Auction closed:

```json
{
  "error": "Bad request",
  "message": "Cannot update bid for closed auction"
}
```

404 Not Found:

```json
{
  "error": "Not found",
  "message": "Bid not found"
}
```

**cURL Example**:

```bash
curl -X PUT http://localhost:3000/api/v1/bids/3 \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 17000
  }'
```

---

### Delete Bid

Remove a bid from an auction.

**Endpoint**: `DELETE /api/v1/bids/:id`

**Authentication**: Required (Bearer Token)

**URL Parameters**:

- `id` (integer, required): Bid ID

**Business Rules**:

- Bid must exist
- Associated auction must be in "LIVE" status
- Cannot delete bids from closed or ended auctions

**Success Response (200)**:

```json
{
  "success": true,
  "message": "Bid deleted successfully"
}
```

**Error Responses**:

400 Bad Request - Invalid ID:

```json
{
  "error": "Bad request",
  "message": "Invalid bid ID"
}
```

400 Bad Request - Auction closed:

```json
{
  "error": "Bad request",
  "message": "Cannot delete bid for closed auction"
}
```

404 Not Found:

```json
{
  "error": "Not found",
  "message": "Bid not found"
}
```

**cURL Example**:

```bash
curl -X DELETE http://localhost:3000/api/v1/bids/3 \
  -H "Authorization: Bearer <your-token>"
```

---

## Health Check

### Health Check Endpoint

Simple endpoint to verify API is running and responsive.

**Endpoint**: `GET /health`

**Authentication**: Not required

**Request Parameters**: None

**Success Response (200)**:

```json
{
  "status": "ok",
  "timestamp": "2024-10-31T12:00:00.000Z"
}
```

**Security Headers**: All responses include Helmet security headers:

- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- X-DNS-Prefetch-Control: off
- X-Download-Options: noopen
- X-Permitted-Cross-Domain-Policies: none

**cURL Example**:

```bash
curl -X GET http://localhost:3000/health
```

---

## Complete Request/Response Examples

### Example 1: Complete Auction Workflow

#### Step 1: Get Authentication Token

```bash
curl -X POST http://localhost:3000/api/v1/auction/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"adminpassword007"}'
```

Response:

```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

#### Step 2: Create a Car

```bash
curl -X POST http://localhost:3000/api/v1/cars \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"make":"Toyota","model":"Camry","year":2023}'
```

Response:

```json
{
  "success": true,
  "message": "Car created successfully",
  "data": { "carId": 1, "make": "Toyota", "model": "Camry", "year": 2023 }
}
```

#### Step 3: Register Dealers

```bash
curl -X POST http://localhost:3000/api/v1/dealers/register \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"name":"John Auto","email":"john@auto.com","password":"password123"}'
```

#### Step 4: Create Auction

```bash
curl -X POST http://localhost:3000/api/v1/auctions \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "carId":1,
    "startTime":"2024-11-01T10:00:00.000Z",
    "endTime":"2024-11-02T10:00:00.000Z",
    "startingPrice":15000
  }'
```

#### Step 5: Activate Auction

```bash
curl -X PATCH http://localhost:3000/api/v1/auctions/1/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"status":"LIVE"}'
```

#### Step 6: Place Bids

```bash
curl -X POST http://localhost:3000/api/v1/auctions/1/bids \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"dealerId":1,"amount":16000}'
```

#### Step 7: End Auction

```bash
curl -X PATCH http://localhost:3000/api/v1/auctions/1/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"status":"ENDED"}'
```

#### Step 8: Get Winner

```bash
curl -X GET http://localhost:3000/api/v1/auctions/1/winner \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Common Patterns and Best Practices

### Pagination

Currently, the API returns all results without pagination. For production use, consider implementing pagination with query parameters:

```
GET /api/v1/cars?page=1&limit=20
```

### Filtering

Add query parameters for filtering results:

```
GET /api/v1/auctions?status=LIVE
GET /api/v1/cars?make=Toyota&year=2023
```

### Sorting

Add sort parameters to control result order:

```
GET /api/v1/bids?sort=bidAmount&order=desc
```

### Error Recovery

- Always check status codes before processing response data
- Implement retry logic with exponential backoff for 429 and 500 errors
- Log detailed error messages for debugging

### Security Best Practices

- Never commit JWT_SECRET to version control
- Rotate authentication tokens regularly
- Use HTTPS in production
- Validate all input on client side before sending to API
- Store tokens securely (never in localStorage for sensitive apps)

### Performance Optimization

- Cache GET requests where appropriate
- Minimize number of API calls by batching operations
- Use conditional requests with ETags (future enhancement)
- Monitor rate limit headers to avoid throttling

---

## Appendix

### Database Schema Overview

**Cars Table**:

- carId (Primary Key, Serial)
- make (String, max 50 chars)
- model (String, max 50 chars)
- year (Integer, 1900-2100)
- createdAt (Timestamp)
- updatedAt (Timestamp)

**Dealers Table**:

- dealerId (Primary Key, Serial)
- name (String, max 100 chars)
- email (String, unique, max 100 chars)
- passwordHash (String, max 255 chars)
- createdAt (Timestamp)
- updatedAt (Timestamp)

**Auctions Table**:

- auctionId (Primary Key, Serial)
- carId (Foreign Key -> Cars)
- startTime (Timestamp)
- endTime (Timestamp, nullable)
- startingPrice (Numeric)
- currentHighestBid (Numeric, nullable)
- status (Enum: DRAFT, LIVE, ENDED, CLOSED, CANCELLED)
- winnerBidId (Foreign Key -> Bids, nullable)
- createdBy (Integer, nullable)
- createdAt (Timestamp)
- updatedAt (Timestamp)

**Bids Table**:

- bidId (Primary Key, Serial)
- auctionId (Foreign Key -> Auctions)
- dealerId (Foreign Key -> Dealers)
- bidAmount (Numeric)
- previousBid (Numeric, nullable)
- timePlaced (Timestamp)

### Environment Variables

Required environment variables for API configuration:

```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=adminpassword007
PORT=3000
NODE_ENV=development
```

### HTTP Status Code Reference

- 200 OK: Request successful
- 201 Created: Resource created successfully
- 400 Bad Request: Invalid request data or validation error
- 401 Unauthorized: Missing or invalid authentication
- 404 Not Found: Resource not found
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Server error

### Content-Type Headers

All requests with body data must include:

```
Content-Type: application/json
```

All responses return:

```
Content-Type: application/json
```

---

**API Version**: 1.0.0  
**Last Updated**: October 31, 2025  
**Documentation Version**: 1.0.0
