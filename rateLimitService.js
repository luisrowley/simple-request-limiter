const express = require('express');
const fs = require('fs');
const path = require('path');
const rateLimiter = require('./limiter');

const app = express();
app.use(express.json());

// Loading config at startup
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
rateLimiter.loadConfig(config);

app.post('/take', (req, res) => {
  const { routeKey } = req.body;
  
  // error handling
  if (!routeKey) {
    return res.status(400).json({ error: 'Missung routeKey' });
  }
  
  if (!rateLimiter.has(routeKey)) {
    return res.status(404).json({ error: `No rate limit configured for route: ${routeKey}` });
  }
  
  // normal execution
  const result = rateLimiter.take(routeKey);
  
  if (!result.accepted) {
    return res.status(429).json({
      accepted: false,
      remaining: 0,
      message: 'Rate limit exceeded. Try again later.',
      config: config
    });
  }
  
  return res.status(200).json({
    accepted: true,
    remaining: result.remaining
  });
});

module.exports = app;
