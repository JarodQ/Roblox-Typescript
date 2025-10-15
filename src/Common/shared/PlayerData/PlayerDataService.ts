import { Players, ReplicatedStorage } from "@rbxts/services";
import { PlayerData, PlayerFlags, Plants } from "./PlayerData";
import { loadPlayerData, savePlayerData, getPlayerKey } from "./DataStoreWrapper";
import { DataStoreService } from "@rbxts/services";

const requestPlayerData = new Instance("RemoteFunction");
requestPlayerData.Name = "RequestPlayerData";
requestPlayerData.Parent = ReplicatedStorage

export const playerCache = new Map<number, PlayerData>();
const lockStore = DataStoreService.GetDataStore("PlayerData_Lock");

Players.PlayerAdded.Connect(async (player) => {
    const data = await loadPlayerData(player.UserId);
    playerCache.set(player.UserId, data);
});

Players.PlayerRemoving.Connect(async (player) => {
    const data = playerCache.get(player.UserId);
    if (data) {
        await savePlayerData(player.UserId, data);

        lockStore.UpdateAsync(getPlayerKey(player.UserId) + ":lock", () => $tuple(undefined));
    }
    playerCache.delete(player.UserId);
});

requestPlayerData.OnServerInvoke = (player: Player) => {
    return playerCache.get(player.UserId);
};

task.spawn(() => {
    while (true) {
        task.wait(60);
        playerCache.forEach((data, userId) => {
            savePlayerData(userId, data)
        });
    }
});

export function getData(player: Player): PlayerData | undefined {
    return playerCache.get(player.UserId);
}

export function lowercaseFirst(str: string): string {
    if (str.size() === 0) return str;

    const first = str.sub(1, 1).lower();

    const rest = str.sub(2);
    print(first, rest);
    return first + rest;
}

export function updateFlag<
    G extends keyof PlayerData,
    K extends keyof PlayerData[G]
>(
    player: Player,
    group: G,
    key: K,
    value: PlayerData[G][K],
) {
    const data = playerCache.get(player.UserId);
    if (!data) return;

    const current = data[group][key];
    if (typeIs(current, typeOf(value))) {
        data[group][key] = value;
        print(`Updated ${group}.${tostring(key)} to ${value} for Player: ${player}`);
    }
}

export function updateFlagByPath(
    player: Player,
    path: string,
    value: unknown
) {
    const data = playerCache.get(player.UserId);
    if (!data) return;

    const keys = path.split(".");
    let target: unknown = data;

    // Traverse to the second-to-last key
    for (let i = 0; i < keys.size() - 1; i++) {
        if (typeOf(target) !== "table") {
            warn(`Invalid path segment: ${keys[i]}`);
            return;
        }

        const segment = keys[i];
        const nextSeg = (target as Record<string, unknown>)[segment];

        if (nextSeg === undefined) {
            warn(`Missing path segment: ${segment}`);
            return;
        }

        target = nextSeg;
    }
    if (typeOf(target) !== "table") {
        warn(`Invalid final target at path: ${path}`);
        return;
    }

    const finalKey = keys[keys.size() - 1];
    const current = (target as Record<string, unknown>)[finalKey];

    const currentType = typeOf(current);
    const valueType = typeOf(value);

    if (currentType === "boolean") {
        (target as Record<string, unknown>)[finalKey] = true;
        print(`Set ${path} to false for Player: ${player}`);
    } else if (currentType === "number" && valueType === "number") {
        const newValue = (current as number) + (value as number);
        (target as Record<string, unknown>)[finalKey] = newValue;
        print(`Added ${value} to ${path}, new value is ${newValue} for Player: ${player}`);
    } else {
        warn(`Type mismatch at ${path}: expected ${currentType}, got ${valueType}`);
    }
}


export function addPlantData(player: Player, plant: Plants) {
    const data = playerCache.get(player.UserId);
    if (!data) return;
    data.plants.push(plant);
}

export function removePlantData(player: Player, position: Vector3) {
    const data = playerCache.get(player.UserId);
    if (!data) return;

    const index = data.plants.findIndex(p =>
        math.abs(p.position.x - position.X) < 0.1 &&
        math.abs(p.position.y - position.Y) < 0.1 &&
        math.abs(p.position.z - position.Z) < 0.1
    );

    if (index !== -1) {
        print(`Removing plant at position:`, position);
        data.plants.remove(index);
    }
}

game.BindToClose(() => {
    for (const [userId, data] of playerCache) {
        savePlayerData(userId, data);
        lockStore.UpdateAsync(`${getPlayerKey(userId)}:lock`, () => $tuple(undefined));
    }
})