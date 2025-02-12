import { Response } from "express";

const subscriptionPool: {
    [topic: string]: Response[]
} = {};

export function subscribe(topic: string, req: Response) {
    if (!subscriptionPool[topic]) {
        subscriptionPool[topic] = [];
    }

    subscriptionPool[topic].push(req);
}

export function publish(topic: string, data: any) {
    const subscribers = subscriptionPool[topic] || [];

    subscribers.forEach(subscriber => {
        subscriber.write(`data: ${JSON.stringify(data)}\n\n`);
    });
}