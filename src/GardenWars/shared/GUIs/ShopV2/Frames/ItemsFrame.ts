import { ItemData } from "Common/server/ItemInfo/ItemData";

export class ItemsFrame {
    private frame: Frame;
    private mode: "buy" | "sell" = "buy";

    constructor(parent: ScreenGui, onItemSelect: (item: ItemData) => void) {
        this.frame = new Instance("Frame");
        this.frame.Name = "ItemsFrame";
        this.frame.Parent = parent;

        const seedsTab = this.createButton("Seeds", () => this.populate("seed", onItemSelect));
        const cropsTab = this.createButton("Crops", () => this.populate("crop", onItemSelect));

        seedsTab.Parent = this.frame;
        cropsTab.Parent = this.frame;

        const grid = new Instance("UIGridLayout");
        grid.Parent = this.frame;
    }

    public setMode(mode: "buy" | "sell") {
        this.mode = mode;
        // Clear and repopulate based on mode
    }

    private populate(category: "seed" | "crop", onItemSelect: (item: ItemData) => void) {
        // Load items from shopList and create buttons
    }

    private createButton(text: string, onClick: () => void): TextButton {
        const button = new Instance("TextButton");
        button.Text = text;
        button.MouseButton1Click.Connect(onClick);
        return button;
    }
}