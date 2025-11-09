// Messaging.ts

import { Profile } from "./Profile";
import { DeepCopyTable } from "./Utils";

export function ProcessGlobalUpdates(profile: Profile, updates: [number, unknown][]) {
    const lockedUpdates = profile["locked_global_updates"] ?? {};
    const receivedUpdates = profile["received_global_updates"] ?? {};
    const handlers = profile["messageHandlers"] ?? [];

    const newUpdates: [number, unknown][] = [];
    const stillPending: Record<number, boolean> = {};

    for (const update of updates) {
        const [rawId] = update;
        const id = rawId as number;

        if (lockedUpdates[id]) {
            stillPending[id] = true;
        } else if (!receivedUpdates[id]) {
            receivedUpdates[id] = true;
            newUpdates.push(update);
        }
    }


    for (const [idStr] of pairs(lockedUpdates)) {
        const id = tonumber(idStr);
        if (id !== undefined && !stillPending[id]) {
            delete lockedUpdates[idStr];
        }
    }



    for (const update of newUpdates) {
        const [id, data] = update;
        for (const handler of handlers) {
            let isProcessed = false;
            const processed = () => {
                isProcessed = true;
                lockedUpdates[id] = true;
            };

            const clonedData = DeepCopyTable(data as Record<string | number, unknown>);
            task.spawn(handler, clonedData, processed);

            if (isProcessed) break;
        }
    }
}
