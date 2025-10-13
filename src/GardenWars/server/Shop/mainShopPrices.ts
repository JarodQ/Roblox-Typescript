

export interface itemInfo {
    buyPrice: number;
    sellPrice: number;
}

export interface shopInfo {
    carrots: itemInfo,
    carrotShooter: itemInfo,
    blueberries: itemInfo,
    blueberryBlaster: itemInfo,
    corn: itemInfo,
    maizeMauler: itemInfo,
    sunflower: itemInfo,
    heliosLaser: itemInfo,
}

export const shopList: shopInfo = {
    carrots: {
        buyPrice: 10,
        sellPrice: 5,
    },
    carrotShooter: {
        buyPrice: 50,
        sellPrice: 25,
    },
    blueberries: {
        buyPrice: 20,
        sellPrice: 10,
    },
    blueberryBlaster: {
        buyPrice: 100,
        sellPrice: 50,
    },
    corn: {
        buyPrice: 40,
        sellPrice: 20,
    },
    maizeMauler: {
        buyPrice: 250,
        sellPrice: 125,
    },
    sunflower: {
        buyPrice: 60,
        sellPrice: 30,
    },
    heliosLaser: {
        buyPrice: 500,
        sellPrice: 250,
    },

}