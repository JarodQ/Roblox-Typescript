import { RunService } from "@rbxts/services";
import { DataStoreService } from "@rbxts/services";
import { PlayerData, DEFAULT_PLAYER_DATA } from "GardenWars/shared/GardenWars/types/PlayerData";

const RUNNING_IN_STUDIO = RunService.IsStudio();
const store = DataStoreService.GetDataStore("PlayerData");
const lockStore = DataStoreService.GetDataStore("PlayerData_Lock");
const SERVER_ID = game.JobId;

// Shared interface
interface IDataStore {
    GetAsync(key: string): LuaTuple<[unknown, DataStoreKeyInfo]>;
    UpdateAsync(
        key: string,
        updateFn: (oldValue: unknown) => LuaTuple<[unknown]>
    ): LuaTuple<[unknown, DataStoreKeyInfo]>;
}

print("🧪 Store object:", store);

function getLockKey(userId: number): string {
    return `${getPlayerKey(userId)}:lock`;
}

// Generates a consistent key format
export function getPlayerKey(userId: number): string {
    return `Player_${userId}`;
}

export function isValidPlayerDataKey(key: string): key is keyof PlayerData {
    return key in DEFAULT_PLAYER_DATA;
}

// Loads and returns player data or falls back to defaults
export async function loadPlayerData(userId: number): Promise<PlayerData> {
    const key = getPlayerKey(userId);
    const lockKey = getLockKey(userId);
    const timestamp = os.time();

    const [existingLock] = lockStore.GetAsync(lockKey);
    if (existingLock && (existingLock as { serverId: String; timestamp: number }).serverId !== SERVER_ID) {
        const age = timestamp - (existingLock as { serverId: string; timestamp: number }).timestamp;
        if (age < 30) {
            warn(`🛑 Lock still active: Player ${userId} on another server`);
            throw "Player data is locked by another session";
        }
        warn(`⚠️ Expired lock detected for Player ${userId}. Overwriting...`);
    }

    lockStore.UpdateAsync(lockKey, () => {
        return $tuple({ serverId: SERVER_ID, timestamp });
    })

    const result = await retryAsync(() => {
        const [data] = store.GetAsync(key);
        return Promise.resolve(data as PlayerData | undefined);
    });

    return result ?? DEFAULT_PLAYER_DATA;
}

// Saves player data using UpdateAsync + proper LuaTuple handling
export async function savePlayerData(userId: number, data: PlayerData): Promise<void> {
    const key = getPlayerKey(userId);
    print("🪵 store =", store);
    await retryAsync(() => {
        print("📦 About to call UpdateAsync");
        const result = store.UpdateAsync(key, (oldValue) => {
            print(`Attempting to save User: ${key}'s date: ${data}`);
            return $tuple(data); // ✅ Wrap the return in $tuple to satisfy roblox-ts
        }) as LuaTuple<[PlayerData | undefined, DataStoreKeyInfo]>;

        const [newValue] = result;
        return Promise.resolve(newValue);
    });
}

export async function retryAsync<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delay = 1,
): Promise<Awaited<T>> {
    let attempts = 0;
    while (true) {
        try {
            print("🔄 retryAsync: Attempt", attempts + 1);
            const result = await fn();
            print("✅ retryAsync succeeded");
            print(`Async Result: ${result}`)
            return result;
        } catch (error) {
            print("❌ retryAsync failed:", error);
            attempts++;
            if (attempts > maxRetries) throw error;
            wait(delay * attempts);
        }
    }
}

