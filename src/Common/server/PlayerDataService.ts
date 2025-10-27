import { Players, ReplicatedStorage } from "@rbxts/services";
import { PlayerData, Plants } from "Common/shared/PlayerData/PlayerData";
import { loadPlayerData, savePlayerData, getPlayerKey } from "./DataStoreWrapper";
import { DataStoreService } from "@rbxts/services";
import { findItemById } from "Common/shared/ItemData";

const requestPlayerData = new Instance("RemoteFunction");
requestPlayerData.Name = "RequestPlayerData";
requestPlayerData.Parent = ReplicatedStorage

const addPlantEvent = new Instance("RemoteEvent");
addPlantEvent.Name = "AddPlant";
addPlantEvent.Parent = ReplicatedStorage;

const removePlantEvent = new Instance("RemoteEvent");
removePlantEvent.Name = "RemovePlant";
removePlantEvent.Parent = ReplicatedStorage;

const updateFlagEvent = new Instance("RemoteEvent");
updateFlagEvent.Name = "UpdateFlagByPath";
updateFlagEvent.Parent = ReplicatedStorage;

const getPlayerData = new Instance("RemoteFunction");
getPlayerData.Name = "GetPlayerData";
getPlayerData.Parent = ReplicatedStorage;

const purchaseFunction = new Instance("RemoteFunction");
purchaseFunction.Name = "PurchaseItem";
purchaseFunction.Parent = ReplicatedStorage;

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

getPlayerData.OnServerInvoke = (player: Player) => {
    return playerCache.get(player.UserId) as PlayerData;
};



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
        print(`Updated ${tostring(group)}.${tostring(key)} to ${value} for Player: ${player}`);
    }
}

updateFlagEvent.OnServerEvent.Connect((player, ...args) => {
    const [path, value] = args as [string, unknown];
    const data = playerCache.get(player.UserId);
    if (!data) return;

    const keys = path.split(".");
    let target: unknown = data;

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
        print(`Set ${path} to true for Player: ${player.Name}`);
    } else if (currentType === "number" && valueType === "number") {
        const newValue = (current as number) + (value as number);
        (target as Record<string, unknown>)[finalKey] = newValue;
        print(`Added ${value} to ${path}, new value is ${newValue} for Player: ${player.Name}`);
    } else {
        warn(`Type mismatch at ${path}: expected ${currentType}, got ${valueType}`);
    }
});


addPlantEvent.OnServerEvent.Connect((player, ...args) => {
    const [plant] = args as [Plants];
    const data = playerCache.get(player.UserId);
    if (!data) return;

    data.plants.push(plant);
    print(`Added plant for ${player.Name}:`, plant);
});

removePlantEvent.OnServerEvent.Connect((player, ...args) => {
    const [position] = args as [Vector3];
    const data = playerCache.get(player.UserId);
    if (!data) return;

    const index = data.plants.findIndex(p =>
        math.abs(p.position.x - position.X) < 0.1 &&
        math.abs(p.position.y - position.Y) < 0.1 &&
        math.abs(p.position.z - position.Z) < 0.1
    );

    if (index !== -1) {
        data.plants.remove(index);
        print(`Removed plant for ${player.Name} at:`, position);
    }
});


purchaseFunction.OnServerInvoke = (player, ...args) => {
    const [itemId, quantity, currency, mode] = args as [string, number, "credits" | "valor", "buy" | "sell"];
    if (quantity <= 0) return;

    const data = playerCache.get(player.UserId);
    if (!data) return;

    const item = findItemById(itemId);
    if (!item) return;

    const pricePerUnit = item.prices[mode][currency];
    if (pricePerUnit === undefined) return;

    const total = pricePerUnit * quantity;
    const playerCurrency = data.currency[currency];

    if (mode === "buy") {
        if (playerCurrency < total) {
            warn(`Player ${player.Name} can't afford ${itemId}`);
            return;
        }
        data.currency[currency] -= total;

        for (const [_, entry] of pairs(data.items)) {
            for (const [_, variant] of pairs(entry.variants)) {
                if (variant.id === itemId) {
                    variant.ownedQuantity += quantity;
                    break;
                }
            }
        }
    } else if (mode === "sell") {
        for (const [_, entry] of pairs(data.items)) {
            for (const [_, variant] of pairs(entry.variants)) {
                if (variant.id === itemId) {
                    if (variant.ownedQuantity < quantity) {
                        warn(`Player ${player.Name} tried to sell too many ${itemId}`);
                        return;
                    }
                    variant.ownedQuantity -= quantity;
                    data.currency[currency] += total;
                    break;
                }
            }
        }
    }

    savePlayerData(player.UserId, data);
    return data; // ✅ Return updated PlayerData
};

game.BindToClose(() => {
    for (const [userId, data] of playerCache) {
        savePlayerData(userId, data);
        lockStore.UpdateAsync(`${getPlayerKey(userId)}:lock`, () => $tuple(undefined));
    }
})