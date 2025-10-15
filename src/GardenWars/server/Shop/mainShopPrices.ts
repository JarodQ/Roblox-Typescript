import { ReplicatedStorage } from "@rbxts/services";

const requestShopPrice = new Instance("RemoteFunction");
requestShopPrice.Name = "RequestShopPrice";
requestShopPrice.Parent = ReplicatedStorage

requestShopPrice.OnServerInvoke = (player: Player, currentItem, transaction): number => {
    let itemPrice;
    print("Receiving shop info for: ", currentItem, " Transaction Type: ", transaction)
    const item = shopList[currentItem as keyof shopInfo];
    if (!item) return 0;
    if (transaction === "Buy") itemPrice = item.buyPrice
    else if (transaction === "Sell") itemPrice = item.sellPrice
    return itemPrice ?? 0;
};

export interface itemInfo {
    buyPrice: number;
    sellPrice: number;
}

export interface shopInfo {
    carrots: itemInfo,
    blueberries: itemInfo,
    corn: itemInfo,
    sunflowers: itemInfo,
}

export const shopList: shopInfo = {
    carrots: {
        buyPrice: 10,
        sellPrice: 5,
    },
    blueberries: {
        buyPrice: 20,
        sellPrice: 10,
    },
    corn: {
        buyPrice: 40,
        sellPrice: 20,
    },
    sunflowers: {
        buyPrice: 60,
        sellPrice: 30,
    },

}