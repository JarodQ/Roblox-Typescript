import { ReplicatedStorage } from "@rbxts/services";
import { playerCache } from "Common/shared/PlayerData/PlayerDataService";
import { shopInfo, shopList } from "./mainShopPrices"

const shopRemoteEvent = new Instance("RemoteEvent");
shopRemoteEvent.Name = "shopRemoteEvent";
shopRemoteEvent.Parent = ReplicatedStorage;

function findValueReference(obj: unknown, targetKey: string): [Record<string, unknown>, string] | undefined {
    if (typeIs(obj, "table")) {
        for (const [key, value] of pairs(obj)) {
            if (key === targetKey && (typeIs(value, "number") || typeIs(value, "boolean"))) {
                return [obj as Record<string, unknown>, key];
            }

            const nested = findValueReference(value, targetKey);
            if (nested !== undefined) {
                return nested;
            }
        }
    }
    return undefined;
}

shopRemoteEvent.OnServerEvent.Connect((player: Player, ...args: unknown[]) => {
    const [action, item] = args as [string, string];
    const playerData = playerCache.get(player.UserId);

    const currencyRef = findValueReference(playerData, "credits");
    const itemRef = findValueReference(playerData, item);

    print("Getting player's data for transaction", playerData);
    print("Player's data of interest: ", currencyRef, itemRef, item);

    if (currencyRef && itemRef) {
        const [currencyParent, currencyKey] = currencyRef;
        const [itemParent, itemKey] = itemRef;

        const buyPrice = shopList[item as keyof shopInfo].buyPrice;
        const currentCurrency = currencyParent[currencyKey] as number;
        const currentItemValue = itemParent[itemKey];

        print(`🛒 ${player.Name} wants to ${action} ${item}`);
        print(`💰 Before: credits = ${currentCurrency}, ${item} = ${currentItemValue}`);

        if (action === "Buy" && currentCurrency >= buyPrice) {

            if (typeIs(currentItemValue, "boolean")) {
                if (!currentItemValue) {
                    itemParent[itemKey] = true;
                    currencyParent[currencyKey] = currentCurrency - buyPrice;
                    print(`✅ Unlocked ${item} for ${buyPrice}`);
                } else {
                    print(`⚠️ ${item} already unlocked`);
                }
            } else if (typeIs(currentItemValue, "number")) {
                itemParent[itemKey] = currentItemValue + 1;
                currencyParent[currencyKey] = currentCurrency - buyPrice;
                print(`✅ Bought ${item} for ${buyPrice}`);
            }
        } else if (action === "Sell") {
            if (typeIs(currentItemValue, "number") && currentItemValue > 0) {
                const sellPrice = shopList[item as keyof shopInfo].sellPrice;
                currencyParent[currencyKey] = currentCurrency + sellPrice;
                itemParent[itemKey] = currentItemValue - 1;

                print(`✅ Sold ${item} for ${sellPrice}`);
            } else {
                print(`❌ Cannot sell ${item}: either not owned or not sellable`);
            }
        } else {
            print(`❌ Transaction failed: Not enough currency or invalid item`);
        }

        const updatedCurrency = currencyParent[currencyKey];
        const updatedItemValue = itemParent[itemKey];

        print(`📊 After: credits = ${updatedCurrency}, ${item} = ${updatedItemValue}`);
    }
});