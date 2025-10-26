import { resolvePlayerData } from "Common/shared/PlayerData/playerDataUtils";
import { PlayerData } from "Common/shared/PlayerData/PlayerData";



export class CurrencyFrame {
    private frame: Frame;

    constructor(parent: ScreenGui, playerData: PlayerData) {
        this.frame = new Instance("Frame");
        this.frame.Name = "CurrencyFrame";
        this.frame.Parent = parent;

        const coinsLabel = new Instance("TextLabel");
        const valorLabel = new Instance("TextLabel");

        const coins = resolvePlayerData(playerData, "coins");
        const valor = resolvePlayerData(playerData, "valor");

        coinsLabel.Text = `Coins: ${coins.exists ? coins.value : "N/A"}`;
        valorLabel.Text = `Valor: ${valor.exists ? valor.value : "N/A"}`;

        coinsLabel.Parent = this.frame;
        valorLabel.Parent = this.frame;
    }
}