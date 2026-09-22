# GateCache

GateCache is a backend-focused API gateway and caching project built with Node.js, Express, MongoDB, and Redis.

I built it to get a better understanding of the infrastructure that usually sits between a client and backend services. Instead of implementing each concept separately, the project puts routing, caching, rate limiting, health checks, retries, load balancing, and metrics into one system.

## What it includes

- L1 in-memory LRU cache
- L2 Redis cache
- Cache promotion from Redis back into L1
- TTL-based cache expiration
- Cache hit, miss, eviction, and hit-ratio statistics
- MongoDB-based route configuration
- Round-robin load balancing
- Backend health checks
- Request timeouts
- Retry handling
- Token bucket rate limiting
- Fixed-window and sliding-window rate limiting implementations
- Backend and request metrics
- Structured logging with Pino
- Automatic MongoDB route seeding
- Docker Compose setup
- Unit and integration tests with Vitest
- HTTP load testing with Autocannon

## How it works

A request first reaches the GateCache gateway.

For GET requests, the gateway checks the local L1 cache first. If the data is not there, it checks Redis. A Redis hit is copied back into L1 so that future requests can be served from memory.

If neither cache contains the response, GateCache looks up the route in MongoDB and sends the request to one of the healthy backend instances.

Non-GET requests are forwarded to the backend without using the response cache.

The main request path is:

```text
Client
  |
  GateCache
  |
  +-- Rate limiter
  |
  +-- L1 cache
  |     |
  |     +-- Hit: return response
  |     |
  |     +-- Miss: check Redis
  |
  +-- Redis
  |     |
  |     +-- Hit: store in L1 and return response
  |     |
  |     +-- Miss: find backend route
  |
  +-- Load balancer
        |
        +-- Backend 1
        +-- Backend 2
        +-- Backend 3
```

## Caching

GateCache uses two cache levels.

### L1: In-memory LRU cache

The L1 cache is implemented using a hash map and a doubly linked list.

This gives:

- O(1) lookup
- O(1) insertion
- O(1) deletion
- LRU eviction

Entries can also expire using TTL.

### L2: Redis

Redis is used as the second cache layer.

When L1 misses, GateCache checks Redis. If Redis has the value, the response is placed back into L1.

This means frequently used data stays close to the application while Redis can keep cached data available even after the GateCache process is restarted.

## Routing and load balancing

Routes are stored in MongoDB. Each route contains a path prefix and a list of backend targets.

For example:

```text
/users

backend-1:4001
backend-2:4002
backend-3:4003
```

GateCache uses round-robin selection across healthy targets.

A simple sequence looks like this:

```text
/users/101    4001
/users/102    4002
/users/103    4003
/users/104    4001
```

Health checks periodically test the backend instances. A failed target is removed from the load-balancing rotation and can be added back when it becomes healthy again.

## Rate limiting

The project contains implementations for:

- Fixed Window
- Sliding Window
- Token Bucket

The Docker setup currently uses Token Bucket.

The limiter keeps track of tokens for each client and gradually refills them. When no token is available, the request receives HTTP `429`.

Rate-limit information is also returned through:

```text
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
```

## Backend failure handling

GateCache has a few basic resilience mechanisms:

- Request timeouts
- Retry attempts
- Backend health checks
- Removal of failed targets from load balancing

For example, if a request fails on one backend, that target is marked unhealthy and the retry can use another healthy backend.

Circuit breaker functionality was considered but is not part of the current implementation. It would be a possible next step for the project.

## Metrics and logging

The gateway keeps track of:

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

Useful endpoints:

```text
GET /health
GET /metrics
GET /cache/stats
```

Pino and Pino HTTP are used for structured request and backend logging.

## Project structure

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

## Running the project

### Requirements

- Docker Desktop
- Git

MongoDB and Redis do not need to be installed locally. Docker Compose handles them.

### Start everything

```bash
git clone https://github.com/vishal316156/gatecache
cd gatecache
docker compose up --build
```

The Compose setup starts:

- GateCache
- MongoDB
- Redis
- Three mock backend servers

The MongoDB route configuration is seeded automatically during startup.

### Check the gateway

In another terminal:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "GateCache"
}
```

Try a gateway request:

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

## Testing load balancing

Run these requests:

```bash
curl http://localhost:3000/gateway/users/101
curl http://localhost:3000/gateway/users/102
curl http://localhost:3000/gateway/users/103
curl http://localhost:3000/gateway/users/104
```

The responses show the requests being distributed across the three mock backend servers.

## Testing the cache

Send the same request twice:

```bash
curl http://localhost:3000/gateway/users/200
curl http://localhost:3000/gateway/users/200
```

Then check the cache statistics:

```bash
curl http://localhost:3000/cache/stats
```

The second request can be served from the cache instead of reaching the backend.

The cache lookup order is:

```text
L1 cache
Redis
Backend
```

Restarting GateCache clears its process-local L1 cache, while Redis can retain the cached response. This can be used to demonstrate Redis-to-L1 cache promotion.

## Running tests

```bash
npm install
npm test
```

The project uses Vitest for unit and integration testing.

## Load testing

The project includes an Autocannon script:

```bash
npm run load-test
```

The current benchmark uses a hot L1 cache workload with 100 concurrent connections for 30 seconds.

One verified run produced:

```text
Requests:     248,214
Throughput:   8,274.4 req/sec
Average:      11.59 ms
P99:          23 ms
Errors:       0
Timeouts:     0
Non-2xx:      0
```

This is a hot-cache benchmark, so the numbers should be interpreted as L1 cache performance rather than a general measure of backend throughput.

## Configuration

The main configuration values are:

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

Docker Compose supplies the values needed for the complete local environment.

## Technology

### Backend

- Node.js
- Express.js
- JavaScript with ES Modules

### Database and caching

- MongoDB
- Redis
- In-memory LRU cache

### Testing

- Vitest
- Autocannon

### Infrastructure

- Docker
- Docker Compose

### Logging and metrics

- Pino
- Pino HTTP
- Custom metrics

## What I learned from the project

The main reason I built GateCache was to understand how backend infrastructure pieces fit together in an actual application.

Some of the areas I worked on were:

- Implementing an O(1) LRU cache with a hash map and doubly linked list
- Designing a two-level cache using Redis as L2
- Promoting cached responses from Redis back into memory
- Implementing different rate-limiting strategies
- Routing requests across multiple backend instances
- Detecting unhealthy backend targets
- Handling retries and request timeouts
- Tracking cache and backend metrics
- Running the whole system through Docker Compose
- Testing the system with automated tests and HTTP load tests

GateCache is intentionally backend-focused. There is no frontend application because the main goal was to work on the gateway, caching, networking, and infrastructure side of the system.
