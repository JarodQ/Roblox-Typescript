import { ItemData } from "Common/server/ItemInfo/ItemData";
import { resolvePlayerData } from "Common/shared/PlayerData/playerDataUtils";

export class ItemInfoFrame {
    private frame: Frame;
    private quantityBox: TextBox;
    private selectedItem: ItemData | undefined;

    constructor(parent: ScreenGui, getSelectedItem: () => ItemData | undefined, playerData: PlayerData) {
        this.frame = new Instance("Frame");
        this.frame.Name = "ItemInfoFrame";
        this.frame.Parent = parent;

        this.quantityBox = new Instance("TextBox");
        this.quantityBox.Text = "1";
        this.quantityBox.Parent = this.frame;

        const plusButtons = [1, 5, 10, 20].map(n => this.createButton(`+${n}`, () => this.adjustQuantity(n)));
        const maxButton = this.createButton("Max", () => this.setMaxQuantity(playerData));

        const coinButton = this.createButton("Buy with Coins", () => this.purchase("coins", playerData));
        const valorButton = this.createButton("Buy with Valor", () => this.purchase("valor", playerData));

        [...plusButtons, maxButton, coinButton, valorButton].forEach(btn => btn.Parent = this.frame);
    }

    public updateItem(item: ItemData) {
        this.selectedItem = item;
        // Update image, description, price, etc.
    }

    private adjustQuantity(amount: number) {
        const current = tonumber(this.quantityBox.Text) ?? 0;
        this.quantityBox.Text = tostring(current + amount);
    }

    private setMaxQuantity(playerData: PlayerData) {
        if (!this.selectedItem) return;
        const currency = resolvePlayerData(playerData, "coins");
        const price = this.selectedItem.prices.buy.coins;
        const max = currency.exists ? math.floor((currency.value as number) / price) : 0;
        this.quantityBox.Text = tostring(max);
    }

    private purchase(currency: "coins" | "valor", playerData: PlayerData) {
        // Deduct currency, update inventory, reset quantity
        this.quantityBox.Text = "1";
    }

    private createButton(text: string, onClick: () => void): TextButton {
        const button = new Instance("TextButton");
        button.Text = text;
        button.MouseButton1Click.Connect(onClick);
        return button;
    }
}