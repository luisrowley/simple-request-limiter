const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config.json');

app.use(bodyParser.json());

const TIME_MS = 60 * 1000;
const tokenBuckets = new Map();
// bucket initialization
config.rateLimitsPerEndpoint.forEach(endpoint => {
    tokenBuckets.set(endpoint.endpoint, {
       tokens: endpoint.sustained,
       burst: endpoint.burst,
       sustained: endpoint.sustained, 
       lastRefresh: Date.now()
    });
});

function calculateTokensToAdd(elapsedTime, sustainedRate) {
    return Math.floor((elapsedTime / TIME_MS) * sustainedRate);
}

// rate-limit middleware
app.post('/take', (req, res) => {
    const { routeTemplate } = req.body;
    
    if (!routeTemplate) {
        return res.status(400).json({
            error: 'Route template is required.' 
        });
    }
    
    if (tokenBuckets.has(routeTemplate)) {
        const bucket = tokenBuckets.get(routeTemplate);
        const currentTime = Date.now();
        const elapsedTime = currentTime - bucket.lastRefresh;
        const sustainedRate = bucket.sustained;
        
        const tokensToAdd = calculateTokensToAdd(elapsedTime, sustainedRate);
        bucket.tokens = Math.min(bucket.tokens + tokensToAdd, bucket.burst);
        bucket.lastRefresh = currentTime;
        
        if (bucket.tokens > 0) {
            bucket.tokens--;
            return res.status(200).json({
                remainingTokens: bucket.tokens,
                allowed: true
            });
        } else {
            return res.status(200).json({
                remainingTokens: 0,
                allowed: false
            });
        }
    } else {
        return res.status(404).json({
            error: 'Route not found.'
        });
    }
});

module.exports = app;