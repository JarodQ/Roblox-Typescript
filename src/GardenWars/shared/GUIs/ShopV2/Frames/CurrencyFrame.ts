import { resolvePlayerData } from "Common/shared/PlayerData/playerDataUtils";
import { PlayerData } from "Common/shared/PlayerData/PlayerData";
import { buildGuiComponent, GuiElementDescriptor } from "./buildGuiComponent";
import { createFrame, createUICorner, createTextLabel, createUIstroke, createImageLabel, createUIGradient } from "../../../../../Common/shared/Guis/Util/GuiPresets";



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
            this.playerCreditAmount.Text = `${credits.exists ? credits.value : "-"}`;
        }
        if (this.playerValorAmount) {
            this.playerValorAmount.Text = `${valor.exists ? valor.value : "-"}`;
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
                    name: "CreditsFrame",
                    backgroundColor: Color3.fromRGB(255, 255, 255),
                    backgroundTransparency: 0,
                    position: UDim2.fromScale(0.073, 0.158),
                    size: UDim2.fromScale(0.403, 0.462),
                    children: [
                        createUICorner({ radius: 8000 }),
                        createUIstroke({
                            color: Color3.fromRGB(200, 150, 0),
                            thickness: 2.4,
                        }),
                        createUIGradient({
                            colorSequence: [
                                [0, Color3.fromRGB(255, 255, 0)],
                                [.5, Color3.fromRGB(255, 200, 0)],
                                [1, Color3.fromRGB(120, 94, 0)]
                            ]
                        }),
                        createImageLabel({
                            name: "CreditsEmblem",
                            backgroundTransparency: 1,
                            position: UDim2.fromScale(-0.176, -0.363),
                            size: UDim2.fromScale(0.4, 1.724),
                            imageId: "rbxassetid://134465210991338",
                        }),
                        createTextLabel({
                            name: "PlayerCreditsLabel",
                            backgroundTransparency: 1,
                            position: UDim2.fromScale(0, 0),
                            size: UDim2.fromScale(0.922, 1),
                            text: "-",
                            textColor: Color3.fromRGB(255, 255, 255),
                            textSize: 22,
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
                    backgroundColor: Color3.fromRGB(255, 255, 255),
                    backgroundTransparency: 0,
                    position: UDim2.fromScale(0.549, 0.191),
                    size: UDim2.fromScale(0.403, 0.462),
                    children: [
                        createUICorner({ radius: 8000 }),
                        createUIstroke({
                            color: Color3.fromRGB(150, 0, 200),
                            thickness: 2.4,
                        }),
                        createUIGradient({
                            colorSequence: [
                                [0, Color3.fromRGB(255, 0, 255)],
                                [.5, Color3.fromRGB(200, 0, 255)],
                                [1, Color3.fromRGB(67, 0, 85)]
                            ]
                        }),
                        createImageLabel({
                            name: "CreditsEmblem",
                            backgroundTransparency: 1,
                            position: UDim2.fromScale(-0.166, -0.45),
                            size: UDim2.fromScale(0.4, 1.724),
                            imageId: "rbxassetid://84652718802743",
                        }),
                        createTextLabel({
                            name: "PlayerValorLabel",
                            backgroundTransparency: 1,
                            position: UDim2.fromScale(0, 0),
                            size: UDim2.fromScale(0.922, 1),
                            text: "-",
                            textColor: Color3.fromRGB(255, 255, 255),
                            textSize: 22,
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