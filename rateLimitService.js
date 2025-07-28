const express = require('express');
const fs = require('fs');
const path = require('path');
const rateLimiter = require('./limiter');

const app = express();
app.use(express.json());

// Load config.json at startup
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
rateLimiter.loadConfig(config);

// Single endpoint
app.post('/take', (req, res) => {
    const { routeKey } = req.body;
  
    if (!routeKey) {
      return res.status(400).json({ error: 'Missing routeKey' });
    }
  
    const result = rateLimiter.take(routeKey);
  
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
  
    if (!result.accepted) {
      return res.status(429).json({
        accepted: false,
        remaining: 0,
        message: 'Rate limit exceeded. Try again later.'
      });
    }
  
    return res.status(200).json({
      accepted: true,
      remaining: result.remaining
    });
  });

module.exports = app;