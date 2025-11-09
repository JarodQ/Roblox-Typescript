// UpdateQueue.ts

const UpdateQueue: Record<string, thread[]> = {};

export function WaitInUpdateQueue(sessionToken: string): () => void {
    let isFirst = false;

    if (!UpdateQueue[sessionToken]) {
        isFirst = true;
        UpdateQueue[sessionToken] = [];
    }

    const queue = UpdateQueue[sessionToken];

    if (!isFirst) {
        queue.push(coroutine.running());
        coroutine.yield();
    }

    return () => {
        const nextCo = queue.shift();
        if (nextCo) {
            coroutine.resume(nextCo);
        } else {
            delete UpdateQueue[sessionToken];
        }
    };
}
