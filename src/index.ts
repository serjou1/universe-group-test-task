import express from 'express';
import Redis from 'ioredis';

import { PORT, REDIS_URL } from './config';

const app = express();

app.use(express.json({ limit: '1mb' }));

const redisClient = new Redis(REDIS_URL);
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

    const redisSubscriber = redisClient.duplicate();

    redisSubscriber.subscribe(topic);

    redisSubscriber.on('message', (channel, message) => {
        if (channel !== topic) return;

        res.write(`data: ${message}\n\n`);
        res.flushHeaders();
    });

    req.on('close', () => {
        console.log('Client disconnected');
        redisSubscriber.unsubscribe(topic);
        redisSubscriber.disconnect();
    });
});

const startServer = async () => {
    if (redisClient.status !== 'connecting' && redisClient.status !== 'connect') {
        await redisClient.connect();
    }
    console.log("Redis connected");
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

startServer();