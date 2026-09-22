# GateCache

A high-performance API gateway and caching engine built with Node.js, Express, MongoDB, and Redis.

GateCache is designed to sit between clients and backend services and handle common backend infrastructure responsibilities such as request routing, caching, rate limiting, health checking, retries, load balancing, and metrics.

The project was built to understand how these components work together in a real backend system rather than treating them as isolated concepts.

## Features

- Multi-level caching
  - L1 in-memory LRU cache
  - L2 Redis cache
  - L2-to-L1 cache promotion
  - TTL-based expiration
  - Cache statistics
- Request routing using MongoDB-based route configuration
- Round-robin load balancing
- Backend health checks
- Request timeout handling
- Retry mechanism with unhealthy-target removal
- Token bucket rate limiting
- Request and backend metrics
- Structured logging with Pino
- Automated backend route seeding
- Dockerized development and testing environment
- Unit tests with Vitest
- HTTP load testing with Autocannon

## Architecture

```text
                         Client
                           |
                           v
                    +--------------+
                    |   GateCache  |
                    | API Gateway  |
                    +------+-------+
                           |
              +------------+------------+
              |            |            |
              v            v            v
          Rate Limit    Cache       Routing
                           |
                    +------+------+
                    |             |
                    v             v
               L1 LRU Cache   L2 Redis
                    |             |
                    |         Redis HIT
                    |             |
                    +------+------+
                           |
                       Cache MISS
                           |
                           v
                  Load Balancer
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
          Backend 1     Backend 2     Backend 3
            :4001         :4002         :4003
```

For a GET request, GateCache first checks the L1 in-memory cache. On an L1 miss, it checks Redis. If Redis contains the response, it promotes that response back into L1.

If both cache layers miss, the request is routed to a healthy backend.

## Request Flow

```text
GET /gateway/users/101
          |
          v
     Rate Limiter
          |
          v
       L1 Cache
       /      \
     HIT      MISS
      |         |
      v         v
   Response   Redis
                |
             +--+--+
            HIT   MISS
             |      |
             v      v
          L1 +    Backend
          Response
```

Non-GET requests bypass the cache and are forwarded directly to the appropriate backend.

## Caching

GateCache uses two cache levels.

### L1: In-memory LRU

The L1 cache uses a hash map combined with a doubly linked list to provide:

- O(1) lookup
- O(1) insertion
- O(1) deletion
- LRU eviction

Entries can also expire based on TTL.

### L2: Redis

Redis acts as the second cache layer.

When an L1 lookup misses:

```text
L1 MISS
   |
   v
Redis HIT
   |
   v
Store in L1
   |
   v
Return response
```

This keeps frequently accessed data close to the application while still allowing cached data to survive a GateCache process restart.

## Load Balancing

Backend targets are stored as route configuration in MongoDB.

For example:

```text
/users
  ├── backend-1:4001
  ├── backend-2:4002
  └── backend-3:4003
```

GateCache uses round-robin selection across healthy targets.

Example:

```text
/users/101 → 4001
/users/102 → 4002
/users/103 → 4003
/users/104 → 4001
```

Health checks periodically verify backend availability. Unhealthy targets are removed from rotation and can be added back when they become healthy again.

## Rate Limiting

GateCache supports multiple rate-limiting strategies:

- Fixed Window
- Sliding Window
- Token Bucket

The current Docker configuration uses the Token Bucket strategy.

The limiter tracks tokens for each client and refills them over time. Requests are rejected with HTTP `429` when no token is available.

Response headers include:

```text
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
```

## Gateway Resilience

The gateway includes:

- Request timeouts
- Retry attempts
- Backend health checks
- Automatic removal of failed targets from load balancing

The current retry flow is:

```text
Request
   |
Backend A
   |
Failure
   |
Mark A unhealthy
   |
Retry
   |
Backend B
```

Circuit breaker functionality was considered but intentionally left outside the current implementation. It can be added later as another resilience layer.

## Metrics

The gateway tracks:

- Total requests
- Backend requests
- Backend failures
- Backend latency
- Rate-limit allowed requests
- Rate-limit rejected requests
- Cache hits
- Cache misses
- Cache evictions
- Cache hit ratio

Useful endpoints include:

```text
GET /metrics
GET /cache/stats
GET /health
```

## Project Structure

```text
gatecache/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── .dockerignore
├── mock-backend/
│   └── server.js
├── scripts/
│   ├── seed.js
│   └── load-test.js
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   ├── cache/
│   │   ├── gateway/
│   │   ├── metrics/
│   │   └── rateLimiter/
│   └── utils/
└── tests/
    ├── integration/
    └── unit/
```

## Running the Project

### Prerequisites

- Docker Desktop
- Git

No local MongoDB or Redis installation is required.

### Start the complete system

```bash
git clone <repository-url>
cd gatecache
docker compose up --build
```

Docker Compose starts GateCache, MongoDB, Redis, and three mock backend instances. MongoDB route configuration is seeded automatically during startup.

### Verify the gateway

In another terminal:

```bash
curl http://localhost:3000/health
```

Expected:

```json
{
  "status": "ok",
  "service": "GateCache"
}
```

Test a gateway request:

```bash
curl http://localhost:3000/gateway/users/101
```

Example response:

```json
{
  "id": 101,
  "name": "User 101",
  "server": "4001"
}
```

## Testing Load Balancing

```bash
curl http://localhost:3000/gateway/users/101
curl http://localhost:3000/gateway/users/102
curl http://localhost:3000/gateway/users/103
curl http://localhost:3000/gateway/users/104
```

The backend responses demonstrate the round-robin behavior across the three mock servers.

## Testing Cache Behavior

Send the same GET request multiple times:

```bash
curl http://localhost:3000/gateway/users/200
curl http://localhost:3000/gateway/users/200
```

Then inspect:

```bash
curl http://localhost:3000/cache/stats
```

The repeated request should be served from cache.

The cache hierarchy is:

```text
L1 Cache
   ↓ MISS
Redis
   ↓ MISS
Backend
```

A GateCache restart clears the process-local L1 cache while Redis can retain the cached response. This can be used to demonstrate L2-to-L1 promotion.

## Running Tests

```bash
npm install
npm test
```

The project uses Vitest for unit and integration testing.

## Load Testing

```bash
npm run load-test
```

The load test uses Autocannon to measure gateway throughput and latency under concurrent requests.

Example metrics include:

```text
Requests/sec
Average latency
p50
p90
p97.5
p99
p99.9
Errors
Timeouts
Non-2xx responses
```

## Configuration

The main configuration values include:

```text
PORT
MONGO_URI
REDIS_URL
JWT_SECRET
CACHE_MAX_SIZE
CACHE_DEFAULT_TTL
RATE_LIMIT_WINDOW
RATE_LIMIT_MAX_REQUESTS
RATE_LIMIT_STRATEGY
```

Docker Compose provides the required values for the complete local environment.

## Technology Stack

### Backend

- Node.js
- Express.js
- JavaScript (ES Modules)

### Data and caching

- MongoDB
- Redis
- In-memory LRU cache

### Testing

- Vitest
- Autocannon

### Infrastructure

- Docker
- Docker Compose

### Observability

- Pino
- Pino HTTP
- Custom metrics

## What I Focused On

The main goal of this project was to understand how common backend infrastructure components work together.

Some of the main implementation areas were:

- Designing an O(1) LRU cache using a hash map and doubly linked list
- Building a two-level cache with Redis as L2
- Handling cache promotion from Redis to memory
- Implementing multiple rate-limiting algorithms
- Routing requests across multiple backend instances
- Detecting unhealthy backend targets
- Adding retry and timeout handling
- Tracking backend and cache metrics
- Containerizing the complete system for reproducible testing

The project is intentionally backend-focused and does not require a frontend application. All functionality can be tested through HTTP APIs, automated tests, Docker Compose, and load tests.
