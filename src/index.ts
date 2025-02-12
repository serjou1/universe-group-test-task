import express from 'express';
import * as subscriptionManager from './subscription-manager';

import { PORT } from './config';

const app = express();

app.use(express.json({ limit: '1mb' }));

app.post('/topics/:topic', (req, res) => {
    const topic = req.params.topic;

    console.log(`Received event for topic ${topic}:`, req.body);

    subscriptionManager.publish(topic, req.body);

    res.send({ ok: true });
});

app.get('/topics/:topic', (req, res) => {
    const topic = req.params.topic;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    subscriptionManager.subscribe(topic, res);

    req.on('close', () => {
        console.log('Client disconnected');
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});