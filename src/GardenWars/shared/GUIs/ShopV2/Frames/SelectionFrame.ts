import { buildGuiComponent, GuiElementDescriptor } from "./buildGuiComponent";
import {
    createUICorner,
    createUIGradient,
    createUIstroke,
    createImageLabel,
    createTextLabel,
    createTextButton
} from "../../../../../Common/shared/Guis/Util/GuiPresets";
import { hoverEffect, unhoverEffect, clickEffect } from "../../../../../Common/shared/Guis/Util/GuiEffects";

export class SelectionFrame {
    private frame: Frame;

    constructor(parent: ScreenGui, onModeChange: (mode: "buy" | "sell") => void) {
        const layout = this.populateLayout(onModeChange, () => parent.Destroy());
        this.frame = buildGuiComponent(layout, parent) as Frame;
    }


    private populateLayout(
        onModeChange: (mode: "buy" | "sell") => void,
        onClose: () => void,
    ): GuiElementDescriptor<"Frame"> {
        // Track button instances for shared click effect
        const buttonInstances: TextButton[] = [];

        // Helper to attach effects
        const attachEffects = (button: TextButton) => {
            buttonInstances.push(button);
            button.MouseEnter.Connect(() => hoverEffect(button));
            button.MouseLeave.Connect(() => unhoverEffect(button));
            button.Activated.Connect(() => clickEffect(button, buttonInstances));
        };

        return {
            type: "Frame",
            name: "SelectionFrame",
            properties: {
                AnchorPoint: new Vector2(0, 0.5),
                BackgroundColor3: Color3.fromRGB(255, 200, 150),
                BackgroundTransparency: 0,
                Position: UDim2.fromScale(0, 0.5),
                Size: UDim2.fromScale(0.053, 0.38),
            },
            children: [
                createUICorner({ radius: 8 }),
                createUIstroke({
                    color: Color3.fromRGB(130, 80, 0),
                    thickness: 3,
                }),
                createTextButton({
                    name: "OpenBuy",
                    position: UDim2.fromScale(0.171, 0.945),
                    size: UDim2.fromScale(0.2, 1.785),
                    anchorPoint: new Vector2(0.5, 1),
                    backgroundColor: Color3.fromRGB(255, 200, 150),
                    backgroundTransparency: 0,
                    text: "",
                    onClick: () => onModeChange("buy"),
                    onMount: attachEffects,
                    children: [
                        createUICorner({ radius: 8000 }),
                        createUIstroke({
                            color: Color3.fromRGB(130, 80, 0),
                            thickness: 3,
                            applyStrokeMode: Enum.ApplyStrokeMode.Border
                        }),
                        createImageLabel({ imageId: "rbxassetid://125258365294427", anchorPoint: new Vector2(0.5, 0), position: UDim2.fromScale(0.35, -0.343) }),
                        createTextLabel({
                            text: "Buy",
                            textStrokeTransparency: 0,
                            anchorPoint: new Vector2(0, 1),
                            position: UDim2.fromScale(0, 1)
                        }),
                    ],
                }),

                createTextButton({
                    name: "OpenSell",
                    position: UDim2.fromScale(0.5, 0.966),
                    size: UDim2.fromScale(0.2, 1.785),
                    anchorPoint: new Vector2(0.5, 1),
                    backgroundColor: Color3.fromRGB(150, 100, 85),
                    backgroundTransparency: 0,
                    text: "",
                    zIndex: 0,
                    onClick: () => onModeChange("sell"),
                    onMount: attachEffects,
                    children: [
                        createUICorner({ radius: 8000 }),
                        createUIstroke({
                            color: Color3.fromRGB(130, 80, 0),
                            thickness: 3,
                            applyStrokeMode: Enum.ApplyStrokeMode.Border
                        }),
                        createImageLabel({ imageId: "rbxassetid://106798179079568", anchorPoint: new Vector2(0.5, 0), position: UDim2.fromScale(0.35, -0.343) }),
                        createTextLabel({
                            text: "Sell",
                            textStrokeTransparency: 0,
                            anchorPoint: new Vector2(0, 1),
                            position: UDim2.fromScale(0, 1)
                        }),

                    ],
                }),

                createTextButton({
                    name: "Close",
                    position: UDim2.fromScale(0.82, 0.944),
                    size: UDim2.fromScale(0.2, 1.785),
                    anchorPoint: new Vector2(0.5, 1),
                    backgroundColor: Color3.fromRGB(150, 100, 85),
                    backgroundTransparency: 0,
                    text: "",
                    zIndex: 0,
                    onClick: () => onClose(),
                    onMount: attachEffects,
                    children: [
                        createUICorner({ radius: 8000 }),
                        createUIstroke({
                            color: Color3.fromRGB(130, 80, 0),
                            thickness: 3,
                            applyStrokeMode: Enum.ApplyStrokeMode.Border
                        }),
                        createImageLabel({
                            imageId: "rbxassetid://87686940256852",
                            anchorPoint: new Vector2(0.5, 0),
                            position: UDim2.fromScale(0.491, -0.247),
                            size: UDim2.fromScale(1.176, 1.176),
                        }),
                        createTextLabel({
                            text: "Close",
                            textStrokeTransparency: 0,
                            anchorPoint: new Vector2(0, 1),
                            position: UDim2.fromScale(0, 1)
                        }),

                    ],
                }),
            ],
        };
    }
}

