import { resolvePlayerData } from "Common/shared/PlayerData/playerDataUtils";
import { PlayerData } from "Common/shared/PlayerData/PlayerData";
import { buildGuiComponent, GuiElementDescriptor } from "./buildGuiComponent";
import { createFrame, createUICorner, createTextLabel } from "../GuiPresets";



export class CurrencyFrame {
    private frame: Frame;
    private playerCreditAmount: TextLabel | undefined;
    private playerValorAmount: TextLabel | undefined;

    constructor(parent: ScreenGui, playerData: PlayerData) {
        this.frame = buildGuiComponent(this.populateLayout(), parent) as Frame;

        // Populate initial currency values
        this.update(playerData);
    }


    public update(playerData: PlayerData) {
        const credits = resolvePlayerData(playerData, "credits");
        const valor = resolvePlayerData(playerData, "valor");

        if (this.playerCreditAmount) {
            this.playerCreditAmount.Text = `Credits: ${credits.exists ? credits.value : "N/A"}`;
        }
        if (this.playerValorAmount) {
            this.playerValorAmount.Text = `Valor: ${valor.exists ? valor.value : "N/A"}`;
        }
    }

    private populateLayout(): GuiElementDescriptor<"Frame"> {
        return {
            type: "Frame",
            name: "CurrencyFrame",
            properties: {
                BackgroundTransparency: 1,
                Position: UDim2.fromScale(0.693, 0.088),
                Size: UDim2.fromScale(0.254, 0.106),
            },
            children: [
                createFrame({
                    name: "CropCreditsFrame",
                    position: UDim2.fromScale(0, 0),
                    size: UDim2.fromScale(0.455, 0.873),
                    children: [
                        createUICorner({ radius: 8 }),
                        createTextLabel({
                            name: "PlayerCreditsLabel",
                            backgroundTransparency: 1,
                            position: UDim2.fromScale(0, 0),
                            size: UDim2.fromScale(1, 1),
                            text: "-",
                            textColor: Color3.fromRGB(0, 200, 0),
                            textSize: 20,
                            textStrokeTransparency: 0,
                            textXAlignment: Enum.TextXAlignment.Right,
                            onMount: (label) => {
                                this.playerCreditAmount = label;
                            },
                        }),
                    ],
                }),
                createFrame({
                    name: "ValorVinesFrame",
                    position: UDim2.fromScale(0.547, 0),
                    size: UDim2.fromScale(0.455, 0.873),
                    children: [
                        createUICorner({ radius: 8 }),
                        createTextLabel({
                            name: "PlayerValorLabel",
                            backgroundTransparency: 1,
                            position: UDim2.fromScale(0, 0),
                            size: UDim2.fromScale(1, 1),
                            text: "-",
                            textColor: Color3.fromRGB(255, 200, 0),
                            textSize: 20,
                            textStrokeTransparency: 0,
                            textXAlignment: Enum.TextXAlignment.Right,
                            onMount: (label) => {
                                this.playerValorAmount = label;
                            },
                        }),
                    ],
                }),
            ],
        }
    }
}