# Simple rate limiter

This Express.js middleware enforces rate limits for specified route templates based on the configuration provided in config.json. It uses the Token Bucket algorithm to control the number of requests allowed within a specified time frame. 

## Middleware Logic
- **Validation**: Checks if the route template is provided in the request body. If not, responds with a 400 Bad Request error.

- **Rate Limit Check**: Compares the request rate for the specified route template against the defined limits.

## Use Cases
- If the limit is not exceeded, the request is allowed, and one token is consumed. It responds with the number of remaining tokens and an "accepted" status of true.

- If the limit is exceeded (empty bucket), the request is rejected. Responds with 0 remaining tokens and an "accepted" status of false. Here the HTTP status code 429 (Too many requests) is implemented following the guidelines from the standard RFC 6585 section 4 (https://datatracker.ietf.org/doc/html/rfc6585#section-4).


## Testing the Rate Limit Service

### Prerequisites

Make sure you have installed dependencies:

```bash
npm install
```

### Run tests

To execute all integration tests:

```bash
npm test
```

This runs tests using Mocha + Chai with chai-http for HTTP assertions.


## Compromises and Possible Improvements
- **In-Memory Storage**: Token buckets are stored in memory, which means they will be reset upon server restart. Consider using a persistent storage solution for long-term rate limit tracking.

- **Scalability**: This implementation might not scale well for extremely high loads. Consider distributed rate limiting solutions or caching mechanisms like Redis for scalability.

- **Logging and Metrics**: Consider adding logging to track rate limit usage and metrics for monitoring and analysis purposes.

- **Token Refill Algorithm**: The current implementation refills tokens linearly over time. If we needed a stricter control over output rate we could also consider using a more precise algorithm like the [Leaky Bucket Algorithm](https://en.wikipedia.org/wiki/Leaky_bucket)). This algorithm can be suitable for network routing or video/audio streaming that may demand a steady output rate or queuing excess traffic. Example: A VoIP system wants exactly 1 audio packet sent every 20 ms — Leaky Bucket ensures that.

- **Optional headers**: To help clients better handle rate limiting, custom headers could be added like:
```js
Retry-After: 2 // (Optional) Seconds to wait before retrying
X-RateLimit-Limit: 100	// Max allowed in burst
```
