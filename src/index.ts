import express from 'express';
import { createClient } from 'redis';

import { PORT, REDIS_URL } from './config';

const app = express();

app.use(express.json({ limit: '1mb' }));

const redisClient = createClient({ url: REDIS_URL });
redisClient.on('error', err => console.log('Redis Client Error', err));

app.post('/topics/:topic', (req, res) => {
    const topic = req.params.topic;

    redisClient.publish(topic, JSON.stringify(req.body));

    res.send({ ok: true });
});

app.get('/topics/:topic', (req, res) => {
    const topic = req.params.topic;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    redisClient.subscribe(topic, (message) => {
        res.write(message);
    });

    req.on('close', () => {
        console.log('Client disconnected');
    });
});


redisClient.connect().then(() => {
    console.log("Redis connected");
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});