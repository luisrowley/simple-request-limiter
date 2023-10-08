# Simple rate limiter

This Express.js middleware enforces rate limits for specified route templates based on the configuration provided in config.json. It uses the Token Bucket algorithm to control the number of requests allowed within a specified time frame. 

## Middleware Logic
- **Validation**: Checks if the route template is provided in the request body. If not, responds with a 400 Bad Request error.

- **Rate Limit Check**: Compares the request rate for the specified route template against the defined limits.

## Use Cases
- If the limit is not exceeded, the request is allowed, and one token is consumed. It responds with the number of remaining tokens and an "allowed" status.
- If the limit is exceeded (empty bucket), the request is rejected. Responds with 0 remaining tokens and an "allowed" status of false.

## Compromises and Possible Improvements
In-Memory Storage: Token buckets are stored in memory, which means they will be reset upon server restart. Consider using a persistent storage solution for long-term rate limit tracking.

- Single Endpoint: The rate limiting is applied uniformly to all routes specified in the config.json file. For more granular control, additional logic could be added to handle different routes differently.

- Scalability: This implementation might not scale well for extremely high loads. Consider distributed rate limiting solutions or caching mechanisms for scalability.

- Logging and Metrics: Consider adding logging to track rate limit usage and metrics for monitoring and analysis purposes.

- Token Refill Algorithm: The current implementation refills tokens linearly over time. For more accurate refilling, consider using a more precise algorithm, especially in a high-throughput scenario (consider [Leaky Bucket Algorithm](https://en.wikipedia.org/wiki/Leaky_bucket)).